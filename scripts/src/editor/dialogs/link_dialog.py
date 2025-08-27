from __future__ import annotations

from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse

from PySide6 import QtCore, QtWidgets

from .base_dialog import BaseDialog


def _is_valid_url(s: str) -> bool:
    """Validación simple de URL: requiere esquema y netloc."""
    try:
        u = urlparse(s.strip())
        return bool(u.scheme and u.netloc)
    except Exception:
        return False


class LinkDialog(BaseDialog):
    """Diálogo para crear/editar un link: text, url, icon (opcional)."""

    @property
    def title(self) -> str:
        return "Editar enlace"

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
        self._edit_text = QtWidgets.QLineEdit()
        self._edit_url = QtWidgets.QLineEdit()
        self._edit_icon = QtWidgets.QLineEdit()

        # Placeholders útiles
        self._edit_text.setPlaceholderText("Ej: GitHub")
        self._edit_url.setPlaceholderText("Ej: https://github.com/usuario")
        self._edit_icon.setPlaceholderText("Opcional, p. ej. 'mdi:github' o 'gh'")

        # Ayuda mínima para URL
        self._lbl_hint = QtWidgets.QLabel("Introduce una URL con esquema (https://…)")
        pal = self._lbl_hint.palette()
        pal.setColor(
            self._lbl_hint.foregroundRole(),
            self.palette().color(
                self.palette().ColorGroup.Disabled, self._lbl_hint.foregroundRole()
            ),
        )
        self._lbl_hint.setPalette(pal)
        self._lbl_hint.setWordWrap(True)

        # --- Layout ---
        form = QtWidgets.QFormLayout()
        form.addRow("Texto", self._edit_text)
        form.addRow("URL", self._edit_url)
        form.addRow("Icono", self._edit_icon)

        root = QtWidgets.QVBoxLayout(self)
        root.addLayout(form)
        root.addWidget(self._lbl_hint)
        root.addWidget(self._buttons)

        # --- Conexiones ---
        self._buttons.accepted.connect(self._on_accept)
        self._buttons.rejected.connect(self.reject)
        self._edit_text.textChanged.connect(self._revalidate)
        self._edit_url.textChanged.connect(self._revalidate)
        self._edit_icon.textChanged.connect(self._revalidate)

    # ------------------------------------------------------------------
    # API pública

    def set_value(self, data: Dict[str, str]) -> None:
        """Rellena los campos desde un dict {'text','url','icon?'}."""
        self._edit_text.setText((data.get("text") or "").strip())
        self._edit_url.setText((data.get("url") or "").strip())
        self._edit_icon.setText((data.get("icon") or "").strip())
        self._revalidate()

    def value(self) -> Dict[str, str]:
        return {
            "text": self._edit_text.text().strip(),
            "url": self._edit_url.text().strip(),
            "icon": self._edit_icon.text().strip(),
        }

    def str(self) -> str:
        text = self._edit_text.text().strip()
        url = self._edit_url.text().strip()
        icon = self._edit_icon.text().strip()
        return f"[{icon}] {text} — {url}" if icon else f"{text} — {url}"

    def tuple(self) -> Tuple[str, str, str]:
        text = self._edit_text.text().strip()
        url = self._edit_url.text().strip()
        icon = self._edit_icon.text().strip()
        return (text, url, icon)

    # ------------------------------------------------------------------
    # Lógica de validación y aceptación

    def _revalidate(self) -> None:
        text_ok = bool(self._edit_text.text().strip())
        url_str = self._edit_url.text().strip()
        url_ok = _is_valid_url(url_str)

        # Feedback visual en el campo URL
        self._set_line_error_state(self._edit_url, not url_ok and bool(url_str))
        self._ok_btn.setEnabled(text_ok and url_ok)

    def _on_accept(self) -> None:
        # Revalidar por si acaso
        self._revalidate()
        if not self._ok_btn.isEnabled():
            # Marcar foco donde falla
            if not self._edit_text.text().strip():
                self._edit_text.setFocus(QtCore.Qt.FocusReason.OtherFocusReason)
            elif not _is_valid_url(self._edit_url.text()):
                self._edit_url.setFocus(QtCore.Qt.FocusReason.OtherFocusReason)
            return
        self.accept()

    # ------------------------------------------------------------------
    # Utilidades UI

    def _set_line_error_state(self, line: QtWidgets.QLineEdit, is_error: bool) -> None:
        base = line.styleSheet()
        # limpiamos estilos previos simples (opcional)
        if "border: 1px solid" in base:
            base = ""
        if is_error:
            line.setStyleSheet("border: 1px solid #cc5555;")
            line.setToolTip("La URL no parece válida. Asegúrate de incluir https://")
        else:
            line.setStyleSheet("")
            line.setToolTip("")
