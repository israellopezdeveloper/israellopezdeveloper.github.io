# src/editor/app/window.py
from pathlib import Path
from typing import Optional

from PySide6 import QtCore, QtWidgets

from editor.dialogs.translate_dialog import TranslateDialog
from editor.services.translate import TranslateWorker

from ..tabs.profile_tab import ProfileTab

from ..tabs.works_tab import WorksTab

from ..tabs.educations_tab import EducationsTab


from ..actions.factory import create_menu_actions, create_button_actions

from ..services.io import load_json, save_json

# from ..services.summarize import summarize_json
from ..models.defaults import ensure_profile_defaults, ensure_educations_defaults


class MainWindow(QtWidgets.QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("CV Editor")
        self.resize(1000, 700)

        self.current_path: Optional[Path] = None
        self.data: dict = {}

        # --- Tabs ---
        self.tabs = QtWidgets.QTabWidget()
        self.tabProfile = ProfileTab()
        self.tabWorks = WorksTab()
        self.tabEdu = EducationsTab()

        self.tabs.addTab(self.tabProfile, "Profile")
        self.tabs.addTab(self.tabWorks, "Works")
        self.tabs.addTab(self.tabEdu, "Educations")
        self.setCentralWidget(self.tabs)

        # --- Actions ---
        self.actions_map = create_menu_actions(self)
        self.actions_toolbar_map = create_button_actions(self)

        # --- Threads ---
        self._tr_thread: Optional[QtCore.QThread] = None
        self._tr_worker: Optional[TranslateWorker] = None
        self._tr_progress: Optional[QtWidgets.QProgressDialog] = None

        self._build_menu()

        # status bar
        self.setStatusBar(QtWidgets.QStatusBar())

    def _ask_save_path(self, tgt: str) -> str | None:
        # Sugerir nombre según archivo actual, si existe
        if self.current_path:
            default_dir = str(self.current_path.parent)
            base = self.current_path.stem
            suggested = str(self.current_path.with_name(f"{base}.{tgt}.json"))
            # corrige doble llave si molesta:
            suggested = suggested.replace(".json}", ".json")
        else:
            from pathlib import Path

            default_dir = str(Path.home())
            suggested = str(Path(default_dir) / f"portfolio.{tgt}.json")

        fn, _ = QtWidgets.QFileDialog.getSaveFileName(
            self, "Guardar JSON traducido", suggested, "JSON (*.json)"
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

        tb = self.addToolBar("Main")
        tb.addAction(self.actions_toolbar_map["new"])
        tb.addAction(self.actions_toolbar_map["open"])
        tb.addAction(self.actions_toolbar_map["save"])
        tb.addSeparator()
        tb.addAction(self.actions_toolbar_map["translate"])
        tb.addAction(self.actions_toolbar_map["summarize"])

    # ------------------------------------------------------------------
    # File operations
    def open_file(self) -> None:
        fn, _ = QtWidgets.QFileDialog.getOpenFileName(
            self, "Abrir JSON", "", "JSON (*.json)"
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
        self._collect_from_tabs()
        try:
            save_json(str(self.current_path), self.data)
        except Exception as e:
            QtWidgets.QMessageBox.critical(self, "Error", f"No se pudo guardar:\n{e}")
            return
        self.statusBar().showMessage(f"Guardado en {self.current_path}", 5000)

    def save_file_as(self) -> None:
        fn, _ = QtWidgets.QFileDialog.getSaveFileName(
            self, "Guardar JSON", "", "JSON (*.json)"
        )
        if not fn:
            return
        self.current_path = Path(fn)
        self.save_file()

    # ------------------------------------------------------------------
    # Data <-> Tabs
    def _load_into_tabs(self) -> None:
        ensure_profile_defaults(self.data)
        ensure_educations_defaults(self.data.get("educations"))

        self.tabProfile.from_data(self.data.get("profile", {}))
        self.tabWorks.from_data(self.data.get("works", []))
        self.tabEdu.from_data(self.data.get("educations", {}))

    def _collect_from_tabs(self) -> None:
        self.data["profile"] = self.tabProfile.value()
        self.data["works"] = self.tabWorks.value()
        self.data["educations"] = self.tabEdu.value()

    # ------------------------------------------------------------------
    # Tools: translate / summarize
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

        # Pregunta dónde guardar ANTES de traducir
        save_path = self._ask_save_path(tgt)
        if not save_path:
            return  # cancelado por el usuario

        # Recoge cambios de las pestañas
        self._collect_from_tabs()

        # Spinner indeterminado (0..0), sin botón Cancelar
        progress = QtWidgets.QProgressDialog("Traduciendo…", "", 0, 0, self)
        progress.setWindowModality(QtCore.Qt.WindowModality.WindowModal)
        progress.setAutoClose(False)
        progress.setAutoReset(False)
        progress.setMinimumDuration(0)
        progress.setCancelButton(None)  # sin "Cancelar"
        progress.show()

        # Hilo + worker
        thread = QtCore.QThread(self)
        worker = TranslateWorker()
        worker.moveToThread(thread)

        def _cleanup():
            progress.reset()
            progress.close()
            thread.quit()
            thread.wait()
            worker.deleteLater()
            thread.deleteLater()

        def _on_finished(res: dict):
            try:
                from editor.services.io import save_json  # type: ignore

                save_json(save_path, res)
                print("PASA 1")
                self.statusBar().showMessage(
                    f"Traducido {src}->{tgt} y guardado en: {save_path}", 7000
                )
                print("PASA 2")
            except Exception as e:
                QtWidgets.QMessageBox.critical(self, "Error al guardar", str(e))
            finally:
                _cleanup()
                print("PASA 3")

        def _on_error(msg: str):
            QtWidgets.QMessageBox.critical(
                self, "Error al traducir", msg or "Error desconocido"
            )
            _cleanup()

        thread.started.connect(lambda: worker.run(self.data, src, tgt))
        worker.finished.connect(_on_finished)
        worker.error.connect(_on_error)

        thread.start()

    def action_summarize(self) -> None:
        if not self.data:
            QtWidgets.QMessageBox.information(self, "Info", "No hay datos cargados")
            return

        ratio, ok = QtWidgets.QInputDialog.getDouble(
            self,
            "Resumir JSON",
            "Ratio (0-1):",
            value=0.5,
            decimals=2,
        )
        if not ok:
            return
        self._collect_from_tabs()
        # self.data = summarize_json(self.data, ratio=ratio)
        # self._load_into_tabs()
        self.statusBar().showMessage(f"Resumido con ratio {ratio}", 5000)
