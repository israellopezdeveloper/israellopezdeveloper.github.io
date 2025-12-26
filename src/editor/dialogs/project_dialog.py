from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from PySide6 import QtCore, QtWidgets

# Utils
from ..utils.lists import CustomList, TechList
# Widgets
from ..widgets.html_editor import HtmlEditor
# Dialogs
from .base_dialog import BaseDialog
from .file_dialog import FileDialog
from .link_dialog import LinkDialog

Qt = QtCore.Qt


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
        suggestions: List[str] = [],
        dialog_dir: Path = Path.cwd(),
    ) -> None:
        super().__init__(
            parent,
            suggestions=suggestions,
            dialog_dir=dialog_dir,
        )

        # --- Campos ---
        self._name = QtWidgets.QLineEdit()
        self._name.setPlaceholderText("Nombre del proyecto (obligatorio)")

        # description
        self._desc = HtmlEditor(show_preview=True, parent=self)
        self._set_desc = self._desc.set_html
        self._get_desc = self._desc.html

        # technologies
        self._techs = TechList(self)
        self._techs.set_suggestions(self._suggestions)

        # links
        self._links = CustomList(
            self,
            dialog_cls=LinkDialog,
            dialog_dir=self._dialog_dir,
        )

        # images
        self._images = CustomList(
            self,
            dialog_cls=FileDialog,
            dialog_dir=self._dialog_dir,
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
