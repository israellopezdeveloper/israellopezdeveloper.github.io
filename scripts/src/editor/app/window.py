# -*- coding: utf-8 -*-
from pathlib import Path
from typing import Dict, Optional

from PySide6 import QtCore, QtWidgets

from editor.dialogs.internationalize_dialog import InternationalizeDialog
from editor.dialogs.translate_dialog import TranslateDialog
from editor.services.internationalize import InternationalizeWorker
from editor.services.summarize import SummarizeWorker
from editor.services.translate import TranslateWorker

from ..tabs.intro_tab import IntroTab
from ..tabs.works_tab import WorksTab
from ..tabs.educations_tab import EducationsTab

from ..actions.factory import create_menu_actions, create_button_actions
from ..services.io import load_json, save_json
from ..models.defaults import ensure_intro_defaults, ensure_educations_defaults


class MainWindow(QtWidgets.QMainWindow):
    def __init__(self, base_dir: Path) -> None:
        super().__init__()
        self.setWindowTitle("CV Editor")
        self.resize(1000, 700)

        # --- Base dir & rutas ---
        self.base_dir: Path = base_dir.expanduser().resolve()
        self.dir_intro_images = self.base_dir / "public" / "images" / "intro"
        self.dir_works_images = self.base_dir / "public" / "images" / "works"
        self.dir_educ_images = self.base_dir / "public" / "images" / "educations"
        self.dir_cv = self.base_dir / "public" / "cv"

        # Garantiza que existen (por si se llama directo)
        for d in (
            self.dir_intro_images,
            self.dir_works_images,
            self.dir_educ_images,
            self.dir_cv,
        ):
            d.mkdir(parents=True, exist_ok=True)

        self.current_path: Optional[Path] = None
        self.data: dict = {}

        # --- Tabs ---
        self.tabs = QtWidgets.QTabWidget()
        self.tabIntro = IntroTab(
            self,
            dialog_dir=self.dir_intro_images,
        )
        self.tabWorks = WorksTab(
            self,
            dialog_dir=self.dir_works_images,
        )
        self.tabEdu = EducationsTab(
            self,
            dialog_dir=self.dir_educ_images,
        )

        self.tabs.addTab(self.tabIntro, "Intro")
        self.tabs.addTab(self.tabWorks, "Works")
        self.tabs.addTab(self.tabEdu, "Educations")
        self.setCentralWidget(self.tabs)

        # --- Actions ---
        self.actions_map = create_menu_actions(self)
        self.actions_toolbar_map = create_button_actions(self)

        # --- Threads (translate) ---
        self._tr_thread: QtCore.QThread | None = None
        self._tr_worker: TranslateWorker | None = None
        self._tr_progress: QtWidgets.QProgressDialog | None = None
        self._tr_save_path: str | None = None
        self._tr_src: str | None = None
        self._tr_tgt: str | None = None

        # --- Threads (summarize) ---
        self._sum_thread: QtCore.QThread | None = None
        self._sum_worker: SummarizeWorker | None = None
        self._sum_progress: QtWidgets.QProgressDialog | None = None
        self._sum_save_path: str | None = None
        self._sum_ratio: float | None = None

        # --- Threads (internationalize) ---
        self._intl_thread: QtCore.QThread | None = None
        self._intl_worker: InternationalizeWorker | None = None
        self._intl_progress: QtWidgets.QProgressDialog | None = None
        self._intl_src: str | None = None
        self._intl_ratio: float | None = None
        self._intl_out_dir: str | None = None  # usaremos self.dir_cv

        self._build_menu()

        # status bar
        self.setStatusBar(QtWidgets.QStatusBar())

    # -------------------- helpers guardar/abrir --------------------

    def _ask_save_path(self, tgt: str) -> str | None:
        """
        Sugerencia en <BASE>/public/cv/<base>.<tgt>.json (o portfolio.<tgt>.json)
        """
        self.dir_cv.mkdir(parents=True, exist_ok=True)
        if self.current_path:
            base = self.current_path.stem
            suggested = str((self.dir_cv / f"{base}.{tgt}.json"))
        else:
            suggested = str(self.dir_cv / f"portfolio.{tgt}.json")

        fn, _ = QtWidgets.QFileDialog.getSaveFileName(
            self, "Guardar JSON traducido", suggested, "JSON (*.json)"
        )
        if not fn:
            return None
        if not fn.lower().endswith(".json"):
            fn += ".json"
        return fn

    def _ask_save_path_summary(self) -> str | None:
        """
        Sugerencia en <BASE>/public/cv/<base>.s.json (o portfolio.s.json)
        """
        self.dir_cv.mkdir(parents=True, exist_ok=True)
        if self.current_path:
            base = self.current_path.stem
            suggested = str(self.dir_cv / f"{base}.s.json")
        else:
            suggested = str(self.dir_cv / "portfolio.s.json")

        fn, _ = QtWidgets.QFileDialog.getSaveFileName(
            self, "Guardar JSON resumido", suggested, "JSON (*.json)"
        )
        if not fn:
            return None
        if not fn.lower().endswith(".json"):
            fn += ".json"
        return fn

    # ------------------------------------------------------------------
    # Menu building
    def _build_menu(self) -> None:
        bar = self.menuBar()

        filem = bar.addMenu("&File")
        filem.addAction(self.actions_map["open"])
        filem.addSeparator()
        filem.addAction(self.actions_map["save"])
        filem.addAction(self.actions_map["save_as"])
        filem.addSeparator()
        filem.addAction(self.actions_map["exit"])

        toolsm = bar.addMenu("&Tools")
        toolsm.addAction(self.actions_map["translate"])
        toolsm.addAction(self.actions_map["summarize"])
        toolsm.addAction(self.actions_map["internationalize"])

        tb = self.addToolBar("Main")
        tb.addAction(self.actions_toolbar_map["new"])
        tb.addAction(self.actions_toolbar_map["open"])
        tb.addAction(self.actions_toolbar_map["save"])
        tb.addSeparator()
        tb.addAction(self.actions_toolbar_map["translate"])
        tb.addAction(self.actions_toolbar_map["summarize"])
        tb.addAction(self.actions_toolbar_map["internationalize"])

    # ------------------------------------------------------------------
    # File operations
    def open_file(self) -> None:
        start_dir = str(self.dir_cv) if self.dir_cv.exists() else ""
        fn, _ = QtWidgets.QFileDialog.getOpenFileName(
            self, "Abrir JSON", start_dir, "JSON (*.json)"
        )
        if not fn:
            return
        self.current_path = Path(fn)
        try:
            self.data = load_json(str(self.current_path))
        except Exception as e:
            QtWidgets.QMessageBox.critical(self, "Error", f"No se pudo abrir:\n{e}")
            return
        self._load_into_tabs()
        self.statusBar().showMessage(f"Abriste {self.current_path}", 5000)

    def save_file(self) -> None:
        if not self.current_path:
            return self.save_file_as()
        value = self._collect_from_tabs()
        try:
            save_json(str(self.current_path), value)
        except Exception as e:
            QtWidgets.QMessageBox.critical(self, "Error", f"No se pudo guardar:\n{e}")
            return
        self.statusBar().showMessage(f"Guardado en {self.current_path}", 5000)

    def save_file_as(self) -> None:
        self.dir_cv.mkdir(parents=True, exist_ok=True)
        base = self.current_path.stem if self.current_path else "portfolio"
        suggested = str(self.dir_cv / f"{base}.json")
        fn, _ = QtWidgets.QFileDialog.getSaveFileName(
            self, "Guardar JSON", suggested, "JSON (*.json)"
        )
        if not fn:
            return
        self.current_path = Path(fn)
        self.save_file()

    # ------------------------------------------------------------------
    # Data <-> Tabs
    def _load_into_tabs(self) -> None:
        ensure_intro_defaults(self.data)
        ensure_educations_defaults(self.data.get("educations"))

        self.tabIntro.from_data(self.data.get("intro", {}))
        self.tabWorks.from_data(self.data.get("works", []))
        self.tabEdu.from_data(self.data.get("educations", {}))

    def _collect_from_tabs(self) -> Dict:
        values: Dict = {}
        values["intro"] = self.tabIntro.value()
        values["works"] = self.tabWorks.value()
        values["educations"] = self.tabEdu.value()
        return values

    # ------------------------------------------------------------------
    # Tools: translate / summarize

    @QtCore.Slot(dict)
    def _tr_on_finished(self, res: dict) -> None:
        try:
            if self._tr_save_path:
                from editor.services.io import save_json  # type: ignore

                save_json(self._tr_save_path, res)
            if self._tr_src and self._tr_tgt and self._tr_save_path:
                self.statusBar().showMessage(
                    f"Traducido {self._tr_src}->{self._tr_tgt} y guardado en: {self._tr_save_path}",
                    7000,
                )
        except Exception as e:
            QtWidgets.QMessageBox.critical(self, "Error al guardar", str(e))
        finally:
            self._tr_cleanup()

    @QtCore.Slot(str)
    def _tr_on_error(self, msg: str) -> None:
        QtWidgets.QMessageBox.critical(
            self, "Error al traducir", msg or "Error desconocido"
        )
        self._tr_cleanup()

    def _tr_cleanup(self) -> None:
        if self._tr_progress:
            self._tr_progress.reset()
            self._tr_progress.close()
        try:
            self.actions_map["translate"].setEnabled(True)
        except Exception:
            pass
        try:
            self.actions_toolbar_map["translate"].setEnabled(True)
        except Exception:
            pass
        if self._tr_thread:
            self._tr_thread.quit()
            self._tr_thread.wait()
            if self._tr_worker:
                self._tr_worker.deleteLater()
            self._tr_thread.deleteLater()
        self._tr_worker = None
        self._tr_thread = None
        self._tr_progress = None
        self._tr_save_path = None
        self._tr_src = None
        self._tr_tgt = None

    @QtCore.Slot(dict)
    def _sum_on_finished(self, res: dict) -> None:
        try:
            if self._sum_save_path:
                from editor.services.io import save_json  # type: ignore

                save_json(self._sum_save_path, res)
            if self._sum_save_path and self._sum_ratio is not None:
                self.statusBar().showMessage(
                    f"Resumido (ratio {self._sum_ratio:.2f}) y guardado en: {self._sum_save_path}",
                    7000,
                )
        except Exception as e:
            QtWidgets.QMessageBox.critical(self, "Error al guardar", str(e))
        finally:
            self._sum_cleanup()

    @QtCore.Slot(str)
    def _sum_on_error(self, msg: str) -> None:
        QtWidgets.QMessageBox.critical(
            self, "Error al resumir", msg or "Error desconocido"
        )
        self._sum_cleanup()

    def _sum_cleanup(self) -> None:
        if self._sum_progress:
            self._sum_progress.reset()
            self._sum_progress.close()
        try:
            self.actions_map["summarize"].setEnabled(True)
        except Exception:
            pass
        try:
            self.actions_toolbar_map["summarize"].setEnabled(True)
        except Exception:
            pass
        if self._sum_thread:
            self._sum_thread.quit()
            self._sum_thread.wait()
            if self._sum_worker:
                self._sum_worker.deleteLater()
            self._sum_thread.deleteLater()
        self._sum_worker = None
        self._sum_thread = None
        self._sum_progress = None
        self._sum_save_path = None
        self._sum_ratio = None

    @QtCore.Slot(dict)
    def _intl_on_finished(self, result: dict) -> None:
        # result: { lang: {"full": dict, "summary": dict}, ... }
        try:
            # Guardar SIEMPRE en <BASE>/public/cv
            out_dir = self.dir_cv
            out_dir.mkdir(parents=True, exist_ok=True)
            base = self.current_path.stem if self.current_path else "portfolio"

            for lang, payload in result.items():
                full = payload.get("full", {})
                summ = payload.get("summary", {})
                fn_full = out_dir / f"{base}.{lang}.json"
                fn_sum = out_dir / f"{base}.{lang}.s.json"
                save_json(str(fn_full), full)
                save_json(str(fn_sum), summ)

            self.statusBar().showMessage(
                f"Internationalize OK. Archivos guardados en {out_dir}", 8000
            )
        except Exception as e:
            QtWidgets.QMessageBox.critical(self, "Error al guardar", str(e))
        finally:
            self._intl_cleanup()

    @QtCore.Slot(str)
    def _intl_on_error(self, msg: str) -> None:
        QtWidgets.QMessageBox.critical(
            self, "Error al internacionalizar", msg or "Error desconocido"
        )
        self._intl_cleanup()

    def _intl_cleanup(self) -> None:
        if self._intl_progress:
            self._intl_progress.reset()
            self._intl_progress.close()
        for key in ("internationalize",):
            try:
                self.actions_map[key].setEnabled(True)
            except Exception:
                pass
            try:
                self.actions_toolbar_map[key].setEnabled(True)
            except Exception:
                pass
        if self._intl_thread:
            self._intl_thread.quit()
            self._intl_thread.wait()
            if self._intl_worker:
                self._intl_worker.deleteLater()
            self._intl_thread.deleteLater()
        self._intl_thread = None
        self._intl_worker = None
        self._intl_progress = None
        self._intl_src = None
        self._intl_ratio = None
        self._intl_out_dir = None

    def action_translate(self) -> None:
        if not self.data:
            QtWidgets.QMessageBox.information(self, "Info", "No hay datos cargados")
            return

        dlg = TranslateDialog(self)
        if not dlg.exec():
            return

        src, tgt = dlg.codes()
        if src == tgt:
            QtWidgets.QMessageBox.warning(
                self, "Aviso", "El idioma de origen y destino no pueden ser iguales."
            )
            return

        save_path = self._ask_save_path(tgt)
        if not save_path:
            return

        self._tr_save_path = save_path
        self._tr_src = src
        self._tr_tgt = tgt

        value = self._collect_from_tabs()

        try:
            self.actions_map["translate"].setEnabled(False)
        except Exception:
            pass
        try:
            self.actions_toolbar_map["translate"].setEnabled(False)
        except Exception:
            pass

        self._tr_progress = QtWidgets.QProgressDialog("Traduciendo…", "", 0, 0, self)
        self._tr_progress.setWindowTitle("Traducción")
        self._tr_progress.setWindowModality(QtCore.Qt.WindowModality.ApplicationModal)
        self._tr_progress.setCancelButton(None)
        self._tr_progress.setAutoClose(False)
        self._tr_progress.setAutoReset(False)
        self._tr_progress.setMinimumDuration(0)
        self._tr_progress.setRange(0, 0)
        self._tr_progress.show()
        self._tr_progress.raise_()
        self._tr_progress.activateWindow()
        QtWidgets.QApplication.processEvents(
            QtCore.QEventLoop.ProcessEventsFlag.AllEvents
        )

        thread = QtCore.QThread(self)
        worker = TranslateWorker()
        worker.moveToThread(thread)
        self._tr_thread = thread
        self._tr_worker = worker

        worker.finished.connect(self._tr_on_finished)
        worker.error.connect(self._tr_on_error)
        thread.started.connect(lambda: worker.run(value, src, tgt))
        QtCore.QTimer.singleShot(0, thread.start)

    def action_summarize(self) -> None:
        if not self.data:
            QtWidgets.QMessageBox.information(self, "Info", "No hay datos cargados")
            return

        ratio, ok = QtWidgets.QInputDialog.getDouble(
            self, "Resumir JSON", "Ratio (0-1):", value=0.2, decimals=2
        )
        if not ok:
            return

        save_path = self._ask_save_path_summary()
        if not save_path:
            return

        self._sum_save_path = save_path
        self._sum_ratio = ratio
        value = self._collect_from_tabs()

        try:
            self.actions_map["summarize"].setEnabled(False)
        except Exception:
            pass
        try:
            self.actions_toolbar_map["summarize"].setEnabled(False)
        except Exception:
            pass

        self._sum_progress = QtWidgets.QProgressDialog("Resumiendo…", "", 0, 0, self)
        self._sum_progress.setWindowTitle("Resumen")
        self._sum_progress.setWindowModality(QtCore.Qt.WindowModality.ApplicationModal)
        self._sum_progress.setCancelButton(None)
        self._sum_progress.setAutoClose(False)
        self._sum_progress.setAutoReset(False)
        self._sum_progress.setMinimumDuration(0)
        self._sum_progress.setRange(0, 0)
        self._sum_progress.show()
        self._sum_progress.raise_()
        self._sum_progress.activateWindow()
        QtWidgets.QApplication.processEvents(
            QtCore.QEventLoop.ProcessEventsFlag.AllEvents
        )

        thread = QtCore.QThread(self)
        worker = SummarizeWorker()
        worker.moveToThread(thread)
        self._sum_thread = thread
        self._sum_worker = worker

        worker.finished.connect(self._sum_on_finished)
        worker.error.connect(self._sum_on_error)
        thread.started.connect(lambda: worker.run(value, ratio))
        QtCore.QTimer.singleShot(0, thread.start)

    def action_internationalize(self) -> None:
        if not self.data:
            QtWidgets.QMessageBox.information(self, "Info", "No hay datos cargados")
            return

        dlg = InternationalizeDialog(self)
        if not dlg.exec():
            return
        src, ratio = dlg.values()

        # Guardamos estado (directo a <BASE>/public/cv)
        self._intl_src = src
        self._intl_ratio = ratio
        self._intl_out_dir = str(self.dir_cv)

        value = self._collect_from_tabs()

        for key in ("internationalize",):
            try:
                self.actions_map[key].setEnabled(False)
            except Exception:
                pass
            try:
                self.actions_toolbar_map[key].setEnabled(False)
            except Exception:
                pass

        self._intl_progress = QtWidgets.QProgressDialog(
            "Internationalizing…", "", 0, 0, self
        )
        self._intl_progress.setWindowTitle("Internationalize")
        self._intl_progress.setWindowModality(QtCore.Qt.WindowModality.ApplicationModal)
        self._intl_progress.setCancelButton(None)
        self._intl_progress.setAutoClose(False)
        self._intl_progress.setAutoReset(False)
        self._intl_progress.setMinimumDuration(0)
        self._intl_progress.setRange(0, 0)
        self._intl_progress.show()
        self._intl_progress.raise_()
        self._intl_progress.activateWindow()
        QtWidgets.QApplication.processEvents(
            QtCore.QEventLoop.ProcessEventsFlag.AllEvents
        )

        thread = QtCore.QThread(self)
        worker = InternationalizeWorker()
        worker.moveToThread(thread)
        self._intl_thread = thread
        self._intl_worker = worker

        worker.finished.connect(self._intl_on_finished)
        worker.error.connect(self._intl_on_error)
        thread.started.connect(lambda: worker.run(value, src, ratio))

        QtCore.QTimer.singleShot(0, thread.start)
