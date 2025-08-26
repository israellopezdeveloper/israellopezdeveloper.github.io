from __future__ import annotations

from pathlib import Path
from typing import Optional
import shutil

from PySide6 import QtCore, QtGui, QtWidgets


class FileSelect(QtWidgets.QWidget):
    """
    Selector de archivo/directorio con QLineEdit + botón "…".
    - Soporta arrastrar/soltar rutas desde el sistema.
    - Puede validar la existencia de la ruta y marcar error visual.
    - Permite alternar entre abrir archivo, guardar archivo o elegir directorio.

    Señales:
      valueChanged(str): se emite en cada cambio del texto.
    """

    valueChanged = QtCore.Signal(str)

    def __init__(
        self,
        *,
        title: str = "Seleccionar archivo",
        file_filter: str = "Todos (*)",
        select_dirs: bool = False,
        must_exist: bool = False,
        dialog_dir: Path = Path.cwd(),
        clearable: bool = True,
        read_only: bool = False,
        parent: Optional[QtWidgets.QWidget] = None,
    ) -> None:
        """
        Args:
            title: Título del diálogo del selector.
            file_filter: Filtro de archivos (solo para abrir/guardar archivos).
            select_dirs: Si True, abre selector de carpetas.
            save_mode: Si True, abre "Guardar como…" (ignora select_dirs).
            must_exist: Si True, valida que la ruta exista (borde rojo si no).
            dialog_dir: Carpeta inicial del diálogo.
            clearable: Muestra botón para limpiar el campo.
            read_only: Hace el QLineEdit de solo lectura.
        """
        super().__init__(parent)
        self._title = title
        self._filter = file_filter
        self._select_dirs = bool(select_dirs)
        self._must_exist = bool(must_exist)
        self._dialog_dir = dialog_dir

        self.setAcceptDrops(True)

        # UI
        self._edit = QtWidgets.QLineEdit()
        self._edit.setReadOnly(read_only)

        self._btn_browse = QtWidgets.QPushButton("…")
        self._btn_browse.setFixedWidth(28)
        self._btn_browse.setCursor(QtCore.Qt.CursorShape.PointingHandCursor)

        self._btn_clear: Optional[QtWidgets.QPushButton] = None
        if clearable:
            self._btn_clear = QtWidgets.QPushButton("×")
            self._btn_clear.setFixedWidth(24)
            self._btn_clear.setCursor(QtCore.Qt.CursorShape.PointingHandCursor)
            self._btn_clear.setToolTip("Limpiar")

        lay = QtWidgets.QHBoxLayout(self)
        lay.setContentsMargins(0, 0, 0, 0)
        lay.setSpacing(6)
        lay.addWidget(self._edit)
        if self._btn_clear:
            lay.addWidget(self._btn_clear)
        lay.addWidget(self._btn_browse)

        # Conexiones
        self._btn_browse.clicked.connect(self._pick)
        if self._btn_clear:
            self._btn_clear.clicked.connect(self._edit.clear)

        self._edit.textChanged.connect(self._on_text_changed)

        # Validación inicial
        self._revalidate()

    # ------------------------- API pública -------------------------

    def value(self) -> str:
        """Devuelve la ruta actual (texto plano)."""
        return self._edit.text().strip()

    def set_value(self, path: str) -> None:
        """Establece la ruta (texto)."""
        self._edit.setText(path or "")

    def set_filter(self, file_filter: str) -> None:
        """Cambia el filtro de archivos (p. ej. 'Imágenes (*.png *.jpg)')."""
        self._filter = file_filter or "Todos (*)"

    def set_title(self, title: str) -> None:
        """Cambia el título del diálogo."""
        self._title = title or "Seleccionar archivo"

    def set_dialog_dir(self, directory: Path) -> None:
        """Cambia el directorio inicial del diálogo."""
        self._dialog_dir = directory

    def setReadOnly(self, ro: bool) -> None:  # noqa: N802 (estilo Qt)
        """Hace el QLineEdit de solo lectura o editable."""
        self._edit.setReadOnly(ro)

    def select(self) -> Optional[str]:
        """Abre el diálogo de selección y devuelve la ruta elegida (o None)."""
        return self._pick(return_path=True)

    # ------------------------- Internos -------------------------

    def _on_text_changed(self, _: str) -> None:
        self._revalidate()
        self.valueChanged.emit(self.value())

    def _start_dir(self) -> str:
        # 1) Dialog dir configurado
        if self._dialog_dir:
            return str(self._dialog_dir.absolute())
        # 2) Carpeta de la ruta actual si existe
        current = self.value()
        if current:
            p = Path(current).expanduser()
            if p.is_dir():
                return str(p)
            if p.exists():
                return str(p.parent)
        # 3) Carpeta HOME
        return str(Path.home())

    def _is_subpath(self, child: Path, parent: Path) -> bool:
        try:
            child.resolve().relative_to(parent.resolve())
            return True
        except Exception:
            return False

    def _unique_dest(self, base_dir: Path, name: str) -> Path:
        base_dir.mkdir(parents=True, exist_ok=True)
        stem = Path(name).stem
        suf = Path(name).suffix
        cand = base_dir / f"{stem}{suf}"
        i = 1
        while cand.exists():
            cand = base_dir / f"{stem}_{i}{suf}"
            i += 1
        return cand

    def _pick(self, *, return_path: bool = False):
        path: Optional[str] = None
        if self._select_dirs:
            path = (
                QtWidgets.QFileDialog.getExistingDirectory(
                    self, self._title, self._start_dir()
                )
                or None
            )
        else:
            path, _ = QtWidgets.QFileDialog.getOpenFileName(
                self, self._title, self._start_dir(), self._filter
            )
            path = path or None

        if path:
            sel = Path(path)
            if self._is_subpath(sel, self._dialog_dir):
                rel = sel.relative_to(self._dialog_dir).as_posix()
                self.set_value(rel)
                return rel if return_path else None
            try:
                dest = self._unique_dest(self._dialog_dir, sel.name)
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(sel, dest)
                rel = dest.relative_to(self._dialog_dir).as_posix()
                self.set_value(rel)
                return rel if return_path else None
            except Exception as e:
                QtWidgets.QMessageBox.critical(
                    self,
                    "Error al copiar",
                    f"No se pudo copiar el archivo seleccionado al directorio de trabajo:\n{e}",
                )
                self.set_value(sel.as_posix())
                return sel.as_posix() if return_path else None
        return path if return_path else None

    def _revalidate(self) -> None:
        """Marca el QLineEdit en rojo si must_exist y no existe."""
        if not self._must_exist:
            self._edit.setStyleSheet("")
            self._edit.setToolTip("")
            return

        txt = self.value()
        ok = bool(txt and Path(txt).expanduser().exists())
        if ok or not txt:
            self._edit.setStyleSheet("")
            self._edit.setToolTip("")
        else:
            self._edit.setStyleSheet("QLineEdit { border: 1px solid #cc5555; }")
            self._edit.setToolTip("La ruta no existe")

    # ------------------------- Drag & Drop -------------------------

    def dragEnterEvent(self, e: QtGui.QDragEnterEvent) -> None:
        if e.mimeData().hasUrls():
            e.acceptProposedAction()
        else:
            e.ignore()

    def dropEvent(self, e: QtGui.QDropEvent) -> None:
        urls = [u for u in e.mimeData().urls() or []]
        if not urls:
            e.ignore()
            return
        local = urls[0].toLocalFile()
        if not local:
            e.ignore()
            return
        # Si selecciona solo directorios y arrastran un archivo, usar su carpeta
        p = Path(local)
        chosen = str(p if (self._select_dirs or p.is_dir()) else p)
        self.set_value(chosen)
        e.acceptProposedAction()


__all__ = ["FileSelect"]
