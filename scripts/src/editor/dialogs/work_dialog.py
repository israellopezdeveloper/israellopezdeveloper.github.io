# src/editor/dialogs/work_dialog.py
from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple
from PySide6 import QtCore, QtWidgets

# ---------- Widgets / utilidades opcionales con fallback ----------
try:
    from ..widgets.html_editor import HtmlEditor  # editor + preview HTML
except Exception:
    HtmlEditor = None  # type: ignore

try:
    from ..widgets.file_select import FileSelect  # selector de archivo reutilizable
except Exception:
    FileSelect = None  # type: ignore

try:
    from ..utils.lists import enable_reorder, move_selected, remove_selected
except Exception:

    def enable_reorder(lw: QtWidgets.QListWidget) -> None:
        lw.setDragEnabled(True)
        lw.setAcceptDrops(True)
        lw.setDefaultDropAction(QtCore.Qt.DropAction.MoveAction)
        lw.setDragDropMode(QtWidgets.QAbstractItemView.DragDropMode.InternalMove)
        lw.setSelectionMode(QtWidgets.QAbstractItemView.SelectionMode.ExtendedSelection)

    def move_selected(lw: QtWidgets.QListWidget, delta: int) -> None:
        rows = sorted({i.row() for i in lw.selectedIndexes()})
        if not rows:
            return
        iterable = reversed(rows) if delta > 0 else rows
        moved: List[int] = []
        for r in iterable:
            nr = r + delta
            if 0 <= nr < lw.count():
                it = lw.takeItem(r)
                lw.insertItem(nr, it)
                moved.append(nr)
        lw.clearSelection()
        for r in moved:
            it = lw.item(r)
            if it is not None:
                it.setSelected(True)
        if moved:
            lw.setCurrentRow(moved[-1])

    def remove_selected(lw: QtWidgets.QListWidget) -> None:
        for r in sorted({i.row() for i in lw.selectedIndexes()}, reverse=True):
            lw.takeItem(r)

    def add_item(
        lw: QtWidgets.QListWidget,
        text: str,
        data: Any | None = None,
        *,
        role: int = int(QtCore.Qt.ItemDataRole.UserRole),
    ) -> QtWidgets.QListWidgetItem:
        it = QtWidgets.QListWidgetItem(text)
        if data is not None:
            it.setData(role, data)
        lw.addItem(it)
        return it


# Dialogs
try:
    from ..dialogs.link_dialog import LinkDialog  # type: ignore
except Exception:
    LinkDialog = None  # type: ignore

try:
    from ..dialogs.project_dialog import ProjectDialog  # <- modal completo
except Exception:
    ProjectDialog = None  # type: ignore


Qt = QtCore.Qt


# -------------------- helpers de datos --------------------
def _s(v: Any) -> str:
    return "" if v is None else str(v)


def _to_link_tuple(d: Dict[str, Any]) -> Tuple[str, str, str]:
    return (_s(d.get("text")), _s(d.get("url")), _s(d.get("icon")))


def _to_link_dict(t: Tuple[str, str, str]) -> Dict[str, str]:
    text, url, icon = t
    out = {"text": text, "url": url}
    if icon:
        out["icon"] = icon
    return out


def _fmt_link(text: str, url: str, icon: str) -> str:
    return f"[{icon}] {text} — {url}" if icon else f"{text} — {url}"


def _fmt_project(p: Dict[str, Any]) -> str:
    """
    Etiqueta: 'name  [tX lY iZ]' si hay tecnologías/links/imágenes.
    """
    nm = _s(p.get("name"))
    n_techs = len(p.get("technologies") or [])
    n_links = len(p.get("links") or [])
    n_imags = len(p.get("images") or [])
    suffix = []
    if n_techs:
        suffix.append(f"t{n_techs}")
    if n_links:
        suffix.append(f"l{n_links}")
    if n_imags:
        suffix.append(f"i{n_imags}")
    return f"{nm}  [{' '.join(suffix)}]" if suffix else nm or "(proyecto)"


# -------------------- fallbacks de UI --------------------
class _FileSelect(QtWidgets.QWidget):
    """Fallback si no existe widgets.file_select.FileSelect."""

    def __init__(self, parent: Optional[QtWidgets.QWidget] = None) -> None:
        super().__init__(parent)
        lay = QtWidgets.QHBoxLayout(self)
        self.edit = QtWidgets.QLineEdit()
        btn = QtWidgets.QPushButton("…")
        lay.addWidget(self.edit)
        lay.addWidget(btn)
        btn.clicked.connect(self._pick)

    def value(self) -> str:
        return self.edit.text().strip()

    def set_value(self, path: str) -> None:
        self.edit.setText(path or "")

    def _pick(self) -> None:
        fn, _ = QtWidgets.QFileDialog.getOpenFileName(
            self,
            "Elegir imagen",
            "",
            "Imágenes (*.png *.jpg *.jpeg *.webp *.gif);;Todos (*)",
        )
        if fn:
            self.edit.setText(fn)


# -------------------- Formulario de un trabajo --------------------
class _WorkForm(QtWidgets.QWidget):
    """Editor de un trabajo con el esquema solicitado."""

    changed = QtCore.Signal()

    def __init__(self, parent: Optional[QtWidgets.QWidget] = None) -> None:
        super().__init__(parent)

        # name
        self._name = QtWidgets.QLineEdit()

        # short_description (texto plano)
        self._short_desc = QtWidgets.QPlainTextEdit()
        self._short_desc.setPlaceholderText("Descripción breve…")

        # thumbnail (selector de imagen)
        if FileSelect is not None:
            self._thumbnail = FileSelect(
                title="Elegir miniatura",
                file_filter="Imágenes (*.png *.jpg *.jpeg *.webp *.gif)",
                must_exist=True,
            )
            set_thumb = self._thumbnail.set_value
            get_thumb = self._thumbnail.value
        else:
            self._thumbnail = _FileSelect()
            set_thumb = self._thumbnail.set_value  # type: ignore[attr-defined]
            get_thumb = self._thumbnail.value  # type: ignore[attr-defined]
        self._set_thumb = set_thumb
        self._get_thumb = get_thumb

        # period_time (start, end, current)
        self._start = QtWidgets.QLineEdit()
        self._start.setPlaceholderText("e.g. 2022-01")
        self._end = QtWidgets.QLineEdit()
        self._end.setPlaceholderText("e.g. 2024-06")
        self._current = QtWidgets.QCheckBox("Actual")

        # full_description (HTML)
        if HtmlEditor:
            self._full_desc = HtmlEditor(show_preview=True, parent=self)
            set_full = self._full_desc.set_html
            get_full = self._full_desc.html
        else:
            self._full_desc = QtWidgets.QPlainTextEdit()
            set_full = self._full_desc.setPlainText  # type: ignore
            get_full = self._full_desc.toPlainText  # type: ignore
        self._set_full = set_full
        self._get_full = get_full

        # contribution (HTML)
        if HtmlEditor:
            self._contrib = HtmlEditor(show_preview=True, parent=self)
            set_contrib = self._contrib.set_html
            get_contrib = self._contrib.html
        else:
            self._contrib = QtWidgets.QPlainTextEdit()
            set_contrib = self._contrib.setPlainText  # type: ignore
            get_contrib = self._contrib.toPlainText  # type: ignore
        self._set_contrib = set_contrib
        self._get_contrib = get_contrib

        # links (lista de dicts)
        self._links = QtWidgets.QListWidget()
        enable_reorder(self._links)
        self._btn_l_add = QtWidgets.QPushButton("Añadir")
        self._btn_l_edit = QtWidgets.QPushButton("Editar")
        self._btn_l_del = QtWidgets.QPushButton("Eliminar")
        self._btn_l_up = QtWidgets.QPushButton("▲")
        self._btn_l_down = QtWidgets.QPushButton("▼")

        # projects (lista; **abre modal** al añadir/editar)
        self._projects = QtWidgets.QListWidget()
        enable_reorder(self._projects)
        self._btn_p_add = QtWidgets.QPushButton("Añadir")
        self._btn_p_edit = QtWidgets.QPushButton("Editar")
        self._btn_p_del = QtWidgets.QPushButton("Eliminar")
        self._btn_p_up = QtWidgets.QPushButton("▲")
        self._btn_p_down = QtWidgets.QPushButton("▼")

        # images (lista de rutas de imagen)
        self._images = QtWidgets.QListWidget()
        enable_reorder(self._images)
        self._btn_i_add = QtWidgets.QPushButton("Añadir")
        self._btn_i_edit = QtWidgets.QPushButton("Cambiar…")
        self._btn_i_del = QtWidgets.QPushButton("Eliminar")
        self._btn_i_up = QtWidgets.QPushButton("▲")
        self._btn_i_down = QtWidgets.QPushButton("▼")

        self._build_ui()
        self._connect()

    # ----- UI -----
    def _build_ui(self) -> None:
        # fila 1: name + thumbnail
        grid = QtWidgets.QGridLayout()
        grid.addWidget(QtWidgets.QLabel("Empresa"), 0, 0)
        grid.addWidget(self._name, 0, 1)
        grid.addWidget(QtWidgets.QLabel("Thumbnail"), 0, 2)
        grid.addWidget(self._thumbnail, 0, 3)

        # period_time
        gdates = QtWidgets.QGridLayout()
        gdates.addWidget(QtWidgets.QLabel("Inicio"), 0, 0)
        gdates.addWidget(self._start, 0, 1)
        gdates.addWidget(QtWidgets.QLabel("Fin"), 0, 2)
        gdates.addWidget(self._end, 0, 3)
        gdates.addWidget(self._current, 0, 4)

        # short_description
        box_short = QtWidgets.QGroupBox("Descripción breve (texto plano)")
        vshort = QtWidgets.QVBoxLayout(box_short)
        vshort.addWidget(self._short_desc)

        # full_description
        box_full = QtWidgets.QGroupBox("Descripción completa (HTML)")
        vfull = QtWidgets.QVBoxLayout(box_full)
        vfull.addWidget(self._full_desc)

        # contribution
        box_contrib = QtWidgets.QGroupBox("Contribución (HTML)")
        vcon = QtWidgets.QVBoxLayout(box_contrib)
        vcon.addWidget(self._contrib)

        def build_section(
            title: str,
            lw: QtWidgets.QListWidget,
            b_add: QtWidgets.QPushButton,
            b_edit: QtWidgets.QPushButton,
            b_del: QtWidgets.QPushButton,
            b_up: QtWidgets.QPushButton,
            b_down: QtWidgets.QPushButton,
        ) -> QtWidgets.QGroupBox:
            box = QtWidgets.QGroupBox(title)
            v = QtWidgets.QVBoxLayout(box)
            v.addWidget(lw)
            row = QtWidgets.QGridLayout()
            row.addWidget(b_add, 0, 0)
            row.addWidget(b_edit, 0, 1)
            row.addWidget(b_del, 0, 2)
            row.addWidget(b_up, 0, 3)
            row.addWidget(b_down, 0, 4)
            v.addLayout(row)
            return box

        box_links = build_section(
            "Links",
            self._links,
            self._btn_l_add,
            self._btn_l_edit,
            self._btn_l_del,
            self._btn_l_up,
            self._btn_l_down,
        )
        box_projects = build_section(
            "Proyectos",
            self._projects,
            self._btn_p_add,
            self._btn_p_edit,
            self._btn_p_del,
            self._btn_p_up,
            self._btn_p_down,
        )
        box_images = build_section(
            "Imágenes",
            self._images,
            self._btn_i_add,
            self._btn_i_edit,
            self._btn_i_del,
            self._btn_i_up,
            self._btn_i_down,
        )

        left = QtWidgets.QVBoxLayout()
        left.addLayout(grid)
        left.addLayout(gdates)
        left.addWidget(box_short)
        left.addWidget(box_full)
        left.addWidget(box_contrib)
        left.addStretch(1)

        right = QtWidgets.QVBoxLayout()
        right.addWidget(box_links)
        right.addWidget(box_projects)
        right.addWidget(box_images)
        right.addStretch(1)

        split = QtWidgets.QSplitter(Qt.Orientation.Horizontal, self)
        wleft = QtWidgets.QWidget()
        wleft.setLayout(left)
        wright = QtWidgets.QWidget()
        wright.setLayout(right)
        split.addWidget(wleft)
        split.addWidget(wright)
        split.setStretchFactor(0, 3)
        split.setStretchFactor(1, 2)
        split.setSizes([900, 500])

        root = QtWidgets.QVBoxLayout(self)
        root.addWidget(split)

    def _connect(self) -> None:
        self._name.textChanged.connect(self.changed)
        self._short_desc.textChanged.connect(self.changed)
        self._start.textChanged.connect(self.changed)
        self._end.textChanged.connect(self.changed)
        self._current.toggled.connect(self.changed)
        if hasattr(self._full_desc, "htmlChanged"):
            self._full_desc.htmlChanged.connect(self.changed)  # type: ignore
        if hasattr(self._contrib, "htmlChanged"):
            self._contrib.htmlChanged.connect(self.changed)  # type: ignore

        # Links
        self._btn_l_add.clicked.connect(self._add_link)
        self._btn_l_edit.clicked.connect(self._edit_link)
        self._btn_l_del.clicked.connect(lambda: remove_selected(self._links))
        self._btn_l_up.clicked.connect(lambda: move_selected(self._links, -1))
        self._btn_l_down.clicked.connect(lambda: move_selected(self._links, +1))

        # Projects (abre modal)
        self._btn_p_add.clicked.connect(self._add_project)
        self._btn_p_edit.clicked.connect(self._edit_project)
        self._btn_p_del.clicked.connect(lambda: remove_selected(self._projects))
        self._btn_p_up.clicked.connect(lambda: move_selected(self._projects, -1))
        self._btn_p_down.clicked.connect(lambda: move_selected(self._projects, +1))

        # Images
        self._btn_i_add.clicked.connect(self._add_image)
        self._btn_i_edit.clicked.connect(self._edit_image)
        self._btn_i_del.clicked.connect(lambda: remove_selected(self._images))
        self._btn_i_up.clicked.connect(lambda: move_selected(self._images, -1))
        self._btn_i_down.clicked.connect(lambda: move_selected(self._images, +1))

    # ----- Links -----
    def _add_link(self) -> None:
        if LinkDialog is not None:
            dlg = LinkDialog(self)
            if dlg.exec():
                v = dlg.value()
                t, u, i = _to_link_tuple(v if isinstance(v, dict) else {})
                it = QtWidgets.QListWidgetItem(_fmt_link(t, u, i))
                it.setData(Qt.ItemDataRole.UserRole, (t, u, i))
                self._links.addItem(it)
                self.changed.emit()
            return
        # fallback
        t, ok = QtWidgets.QInputDialog.getText(self, "Link", "Texto:")
        if not ok:
            return
        u, ok = QtWidgets.QInputDialog.getText(self, "Link", "URL:")
        if not ok:
            return
        i, _ = QtWidgets.QInputDialog.getText(self, "Link", "Icono (opcional):")
        it = QtWidgets.QListWidgetItem(_fmt_link(t.strip(), u.strip(), i.strip()))
        it.setData(Qt.ItemDataRole.UserRole, (t.strip(), u.strip(), i.strip()))
        self._links.addItem(it)
        self.changed.emit()

    def _edit_link(self) -> None:
        it = self._links.currentItem()
        if not it:
            return
        cur: Tuple[str, str, str] = it.data(Qt.ItemDataRole.UserRole) or ("", "", "")
        if LinkDialog is not None:
            dlg = LinkDialog(self)
            try:
                dlg.set_value({"text": cur[0], "url": cur[1], "icon": cur[2]})
            except Exception:
                pass
            if dlg.exec():
                v = dlg.value()
                t, u, i = _to_link_tuple(v if isinstance(v, dict) else {})
                it.setText(_fmt_link(t, u, i))
                it.setData(Qt.ItemDataRole.UserRole, (t, u, i))
                self.changed.emit()
            return
        # fallback
        t, ok = QtWidgets.QInputDialog.getText(self, "Link", "Texto:", text=cur[0])
        if not ok:
            return
        u, ok = QtWidgets.QInputDialog.getText(self, "Link", "URL:", text=cur[1])
        if not ok:
            return
        i, _ = QtWidgets.QInputDialog.getText(
            self, "Link", "Icono (opcional):", text=cur[2]
        )
        it.setText(_fmt_link(t.strip(), u.strip(), i.strip()))
        it.setData(Qt.ItemDataRole.UserRole, (t.strip(), u.strip(), i.strip()))
        self.changed.emit()

    # ----- Projects (SIEMPRE modal si está disponible) -----
    def _add_project(self) -> None:
        if ProjectDialog is not None:
            dlg = ProjectDialog(self)
            # (opcional) sugerencias de tecnologías a partir de otros proyectos del mismo trabajo
            tech_pool = self._collect_existing_techs()
            if hasattr(dlg, "set_tech_suggestions"):
                dlg.set_tech_suggestions(sorted(tech_pool))
            if dlg.exec():
                proj = dlg.value()  # dict completo
                it = QtWidgets.QListWidgetItem(_fmt_project(proj))
                it.setData(Qt.ItemDataRole.UserRole, proj)
                self._projects.addItem(it)
                self.changed.emit()
            return
        # fallback mínimo: solo nombre
        nm, ok = QtWidgets.QInputDialog.getText(self, "Proyecto", "Nombre:")
        if not ok:
            return
        proj = {
            "name": nm.strip(),
            "description": "",
            "technologies": [],
            "links": [],
            "images": [],
        }
        it = QtWidgets.QListWidgetItem(_fmt_project(proj))
        it.setData(Qt.ItemDataRole.UserRole, proj)
        self._projects.addItem(it)
        self.changed.emit()

    def _edit_project(self) -> None:
        it = self._projects.currentItem()
        if not it:
            return
        cur: Dict[str, Any] = it.data(Qt.ItemDataRole.UserRole) or {}
        if ProjectDialog is not None:
            dlg = ProjectDialog(self)
            if hasattr(dlg, "set_value"):
                try:
                    dlg.set_value(cur)
                except Exception:
                    pass
            tech_pool = self._collect_existing_techs()
            if hasattr(dlg, "set_tech_suggestions"):
                dlg.set_tech_suggestions(sorted(tech_pool))
            if dlg.exec():
                proj = dlg.value()
                it.setText(_fmt_project(proj))
                it.setData(Qt.ItemDataRole.UserRole, proj)
                self.changed.emit()
            return
        # fallback: editar solo nombre
        nm, ok = QtWidgets.QInputDialog.getText(
            self, "Proyecto", "Nombre:", text=_s(cur.get("name"))
        )
        if not ok:
            return
        cur["name"] = nm.strip()
        it.setText(_fmt_project(cur))
        it.setData(Qt.ItemDataRole.UserRole, cur)
        self.changed.emit()

    def _collect_existing_techs(self) -> List[str]:
        """Agrupa tecnologías de los proyectos ya listados (para sugerencias)."""
        seen = set()
        for i in range(self._projects.count()):
            it = self._projects.item(i)
            pj = it.data(Qt.ItemDataRole.UserRole) or {}
            for t in pj.get("technologies") or []:
                if t:
                    seen.add(str(t))
        return list(seen)

    # ----- Images -----
    def _add_image(self) -> None:
        fns, _ = QtWidgets.QFileDialog.getOpenFileNames(
            self,
            "Añadir imágenes",
            "",
            "Imágenes (*.png *.jpg *.jpeg *.webp *.gif);;Todos (*)",
        )
        for fn in fns or []:
            it = QtWidgets.QListWidgetItem(fn)
            it.setData(Qt.ItemDataRole.UserRole, fn)
            self._images.addItem(it)
        if fns:
            self.changed.emit()

    def _edit_image(self) -> None:
        it = self._images.currentItem()
        if not it:
            return
        fn, _ = QtWidgets.QFileDialog.getOpenFileName(
            self,
            "Cambiar imagen",
            "",
            "Imágenes (*.png *.jpg *.jpeg *.webp *.gif);;Todos (*)",
        )
        if fn:
            it.setText(fn)
            it.setData(Qt.ItemDataRole.UserRole, fn)
            self.changed.emit()

    # ----- carga/volcado -----
    def set_value(self, w: Dict[str, Any]) -> None:
        self._name.setText(_s(w.get("name")))
        self._short_desc.setPlainText(_s(w.get("short_description")))
        self._set_thumb(_s(w.get("thumbnail")))

        period = w.get("period_time") or {}
        start = _s(period.get("start") or w.get("start"))
        end = _s(period.get("end") or w.get("end"))
        current = bool(
            period.get("current") if "current" in period else w.get("current")
        )
        self._start.setText(start)
        self._end.setText(end)
        self._current.setChecked(current)

        self._set_full(_s(w.get("full_description")))
        self._set_contrib(_s(w.get("contribution")))

        self._links.clear()
        for lk in w.get("links") or []:
            t, u, i = _to_link_tuple(lk if isinstance(lk, dict) else {})
            it = QtWidgets.QListWidgetItem(_fmt_link(t, u, i))
            it.setData(Qt.ItemDataRole.UserRole, (t, u, i))
            self._links.addItem(it)

        self._projects.clear()
        for pj in w.get("projects") or []:
            proj = dict(pj) if isinstance(pj, dict) else {"name": _s(pj)}
            it = QtWidgets.QListWidgetItem(_fmt_project(proj))
            it.setData(Qt.ItemDataRole.UserRole, proj)
            self._projects.addItem(it)

        self._images.clear()
        for path in w.get("images") or []:
            p = _s(path)
            it = QtWidgets.QListWidgetItem(p)
            it.setData(Qt.ItemDataRole.UserRole, p)
            self._images.addItem(it)

    def value(self) -> Dict[str, Any]:
        out: Dict[str, Any] = {
            "name": self._name.text().strip(),
            "short_description": self._short_desc.toPlainText().strip(),
            "thumbnail": self._get_thumb().strip(),
            "period_time": {
                "start": self._start.text().strip(),
                "end": self._end.text().strip(),
                "current": self._current.isChecked(),
            },
            "full_description": self._get_full().strip(),
            "contribution": self._get_contrib().strip(),
            "links": [],
            "projects": [],
            "images": [],
        }
        # links
        for i in range(self._links.count()):
            it = self._links.item(i)
            t: Tuple[str, str, str] = it.data(Qt.ItemDataRole.UserRole) or ("", "", "")
            out["links"].append(_to_link_dict(t))
        # projects
        for i in range(self._projects.count()):
            it = self._projects.item(i)
            proj: Dict[str, Any] = it.data(Qt.ItemDataRole.UserRole) or {}
            clean = {
                "name": _s(proj.get("name")).strip(),
                "description": _s(proj.get("description")),
                "technologies": [
                    str(t) for t in (proj.get("technologies") or []) if str(t).strip()
                ],
                "links": proj.get("links") or [],
                "images": [
                    str(p) for p in (proj.get("images") or []) if str(p).strip()
                ],
            }
            out["projects"].append(clean)
        # images
        for i in range(self._images.count()):
            it = self._images.item(i)
            path: str = it.data(Qt.ItemDataRole.UserRole) or ""
            if path:
                out["images"].append(path)
        return out


# -------------------- Modal que envuelve el formulario --------------------
class WorkDialog(QtWidgets.QDialog):
    """Diálogo modal para crear/editar un trabajo."""

    def __init__(self, parent: Optional[QtWidgets.QWidget] = None) -> None:
        super().__init__(parent)
        self.setWindowTitle("Trabajo")
        self.setModal(True)

        self._form = _WorkForm(self)
        btns = QtWidgets.QDialogButtonBox(
            QtWidgets.QDialogButtonBox.StandardButton.Ok
            | QtWidgets.QDialogButtonBox.StandardButton.Cancel
        )
        btns.accepted.connect(self.accept)
        btns.rejected.connect(self.reject)

        lay = QtWidgets.QVBoxLayout(self)
        lay.addWidget(self._form)
        lay.addWidget(btns)

    # API de datos
    def set_value(self, work: Dict[str, Any]) -> None:
        self._form.set_value(work)

    def value(self) -> Dict[str, Any]:
        return self._form.value()


__all__ = ["WorkDialog"]
