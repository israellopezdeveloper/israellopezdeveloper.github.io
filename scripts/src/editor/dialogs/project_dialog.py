from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple

from PySide6 import QtCore, QtWidgets

# Utils
from ..utils.lists import (
    CustomList,
    add_item,
    enable_reorder,
    move_selected,
    remove_selected,
)

# Widgets
from ..widgets.html_editor import HtmlEditor

# Dialogs
from .base_dialog import BaseDialog
from .file_dialog import FileDialog
from .link_dialog import LinkDialog

Qt = QtCore.Qt


# -------- componente propio: TechList --------
class TechList(QtWidgets.QWidget):
    """
    Lista de tecnologías con campo de entrada y sugerencias.
    - Deduplica case-insensitive.
    - Si el texto coincide (case-insensitive) con una sugerencia, usa la forma canónica
      de la sugerencia para estandarizar grafía.
    API:
      set_value(list[str]), value() -> list[str]
      set_suggestions(list[str])
    """

    changed = QtCore.Signal()

    def __init__(self, parent: Optional[QtWidgets.QWidget] = None) -> None:
        super().__init__(parent)
        self._suggestions: List[str] = []

        self._edit = QtWidgets.QLineEdit()
        self._edit.setPlaceholderText("Añadir tecnología…")
        self._btn_add = QtWidgets.QPushButton("+")
        self._btn_add.setFixedWidth(28)

        self._list = QtWidgets.QListWidget()
        enable_reorder(self._list)

        top = QtWidgets.QHBoxLayout()
        top.addWidget(self._edit)
        top.addWidget(self._btn_add)

        root = QtWidgets.QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.addLayout(top)
        root.addWidget(self._list)

        # Completer (sugerencias)
        self._completer = QtWidgets.QCompleter([], self)
        self._completer.setCaseSensitivity(Qt.CaseSensitivity.CaseInsensitive)
        self._completer.setFilterMode(Qt.MatchFlag.MatchContains)
        self._edit.setCompleter(self._completer)

        # Botonera secundaria
        self._btn_edit = QtWidgets.QPushButton("Editar")
        self._btn_del = QtWidgets.QPushButton("Eliminar")
        self._btn_up = QtWidgets.QPushButton("▲")
        self._btn_down = QtWidgets.QPushButton("▼")
        grid = QtWidgets.QGridLayout()
        grid.addWidget(self._btn_edit, 0, 0)
        grid.addWidget(self._btn_del, 0, 1)
        grid.addWidget(self._btn_up, 0, 2)
        grid.addWidget(self._btn_down, 0, 3)
        root.addLayout(grid)

        # Conexiones
        self._btn_add.clicked.connect(self._on_add)
        self._edit.returnPressed.connect(self._on_add)
        self._btn_edit.clicked.connect(self._on_edit)
        self._btn_del.clicked.connect(
            lambda: (remove_selected(self._list), self.changed.emit())
        )
        self._btn_up.clicked.connect(
            lambda: (move_selected(self._list, -1), self.changed.emit())
        )
        self._btn_down.clicked.connect(
            lambda: (move_selected(self._list, +1), self.changed.emit())
        )
        self._list.itemChanged.connect(self._emit_changed)
        self._list.itemSelectionChanged.connect(self._emit_changed)

    # API
    def set_value(self, items: List[str] | None) -> None:
        self._list.clear()
        for t in items or []:
            add_item(self._list, str(t))

    def value(self) -> List[str]:
        return [self._list.item(i).text() for i in range(self._list.count())]

    def set_suggestions(self, items: List[str]) -> None:
        self._suggestions = [i for i in items if i]
        model = QtCore.QStringListModel(self._suggestions, self)
        self._completer.setModel(model)

    # Internos
    def _emit_changed(self) -> None:
        self.changed.emit()

    def _canonical(self, text: str) -> str:
        """Devuelve forma canónica según sugerencias (si coincide)."""
        t = text.strip()
        if not t:
            return t
        for s in self._suggestions:
            if s.casefold() == t.casefold():
                return s  # usar grafía sugerida
        return t

    def _exists(self, text: str) -> bool:
        norm = text.casefold().strip()
        for i in range(self._list.count()):
            if self._list.item(i).text().casefold().strip() == norm:
                return True
        return False

    def _on_add(self) -> None:
        raw = self._edit.text()
        can = self._canonical(raw)
        if not can:
            return
        if self._exists(can):
            # Selecciona el existente
            for i in range(self._list.count()):
                if (
                    self._list.item(i).text().casefold().strip()
                    == can.casefold().strip()
                ):
                    self._list.setCurrentRow(i)
                    break
            return
        add_item(self._list, can)
        self._edit.clear()
        self.changed.emit()

    def _on_edit(self) -> None:
        it = self._list.currentItem()
        if not it:
            return
        txt, ok = QtWidgets.QInputDialog.getText(
            self, "Editar tecnología", "Nombre:", text=it.text()
        )
        if not ok:
            return
        can = self._canonical(txt)
        if not can:
            return
        it.setText(can)
        self.changed.emit()


# -------- diálogo principal --------
class ProjectDialog(BaseDialog):
    """Proyecto con:
    - name (texto)
    - description (HTML)
    - technologies (lista con sugerencias)
    - links (lista)
    - images (lista)
    """

    def __init__(
        self,
        parent: Optional[QtWidgets.QWidget] = None,
    ) -> None:
        super().__init__(parent)

        # --- Campos ---
        self._name = QtWidgets.QLineEdit()
        self._name.setPlaceholderText("Nombre del proyecto (obligatorio)")

        # description
        self._desc = HtmlEditor(show_preview=True, parent=self)
        self._set_desc = self._desc.set_html
        self._get_desc = self._desc.html

        # technologies
        self._techs = TechList()

        # links
        self._links = CustomList(
            self,
            dialog_cls=LinkDialog,
        )

        # images
        self._images = CustomList(
            self,
            dialog_cls=FileDialog,
        )

        # --- Layout ---
        form = QtWidgets.QFormLayout()
        form.addRow("Nombre", self._name)

        box_desc = QtWidgets.QGroupBox("Descripción (HTML)")
        vdesc = QtWidgets.QVBoxLayout(box_desc)
        vdesc.addWidget(self._desc)

        box_tech = QtWidgets.QGroupBox("Tecnologías")
        vtech = QtWidgets.QVBoxLayout(box_tech)
        vtech.addWidget(self._techs)

        box_links = QtWidgets.QGroupBox("Links", self)
        vl = QtWidgets.QVBoxLayout(box_links)
        vl.addWidget(self._links)

        box_images = QtWidgets.QGroupBox("Images", self)
        vl = QtWidgets.QVBoxLayout(box_images)
        vl.addWidget(self._images)

        # Splitter principal: izquierda (desc+techs) / derecha (links+images)
        left = QtWidgets.QVBoxLayout()
        left.addLayout(form)
        left.addWidget(box_desc)
        left.addWidget(box_tech)
        left.addStretch(1)
        wleft = QtWidgets.QWidget()
        wleft.setLayout(left)

        right = QtWidgets.QVBoxLayout()
        right.addWidget(box_links)
        right.addWidget(box_images)
        right.addStretch(1)
        wright = QtWidgets.QWidget()
        wright.setLayout(right)

        split = QtWidgets.QSplitter(Qt.Orientation.Horizontal, self)
        split.setChildrenCollapsible(False)
        split.setOpaqueResize(True)
        split.addWidget(wleft)
        split.addWidget(wright)
        split.setStretchFactor(0, 3)
        split.setStretchFactor(1, 2)
        split.setSizes([600, 300])

        root = QtWidgets.QVBoxLayout(self)
        root.addWidget(split)
        root.addWidget(self._buttons)

        # Conexiones
        self._buttons.accepted.connect(self._on_accept)
        self._buttons.rejected.connect(self.reject)
        self._name.textChanged.connect(self._revalidate)

    # ------- API pública -------
    def set_value(self, data: Dict[str, Any]) -> None:
        self._name.setText(str(data.get("name")))
        self._set_desc(str(data.get("description")))
        self._techs.set_value([str(tech) for tech in (data.get("technologies") or [])])

        self._links.setData(data.get("links") or [])
        self._images.setData(
            list(
                map(
                    lambda img: {"path": img} if isinstance(img, str) else img,
                    data.get("images") or [],
                )
            )
        )

        self._revalidate()

    def value(self) -> Dict[str, Any]:
        return {
            "name": self._name.text().strip(),
            "description": self._get_desc().strip(),
            "technologies": self._techs.value(),
            "links": self._links.data(),
            "images": list(map(lambda item: item.get("path"), self._images.data())),
        }

    def str(self) -> str:
        return self._name.text().strip()

    def tuple(self) -> Tuple[str]:
        name = self._name.text().strip()
        return (name,)

    def set_tech_suggestions(self, items: List[str]) -> None:
        self._techs.set_suggestions(items)

    # ------- lógicas internas -------
    def _revalidate(self) -> None:
        self._ok_btn.setEnabled(bool(self._name.text().strip()))

    def _on_accept(self) -> None:
        self._revalidate()
        if not self._ok_btn.isEnabled():
            self._name.setFocus(QtCore.Qt.FocusReason.OtherFocusReason)
            return
        self.accept()


__all__ = ["ProjectDialog", "TechList"]
