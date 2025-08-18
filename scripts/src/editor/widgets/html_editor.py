# src/editor/widgets/html_editor.py
from __future__ import annotations
from typing import Optional, List
from PySide6 import QtCore, QtGui, QtWidgets

# Preview: WebEngine si está disponible; si no, QTextBrowser
try:
    from PySide6.QtWebEngineWidgets import QWebEngineView

    HAS_WEB = True
except Exception:
    QWebEngineView = None  # type: ignore
    HAS_WEB = False


class HtmlEditor(QtWidgets.QWidget):
    """
    Editor HTML con toolbar de formato y vista previa.
    Botones: H1, H2, H3, lista, lista numerada, tabla.
    """

    htmlChanged = QtCore.Signal(str)

    def __init__(
        self,
        *,
        show_preview: bool = True,
        read_only: bool = False,
        parent: Optional[QtWidgets.QWidget] = None,
    ) -> None:
        super().__init__(parent)

        # --- Editor ---
        self._edit = QtWidgets.QPlainTextEdit()
        self._edit.setLineWrapMode(QtWidgets.QPlainTextEdit.LineWrapMode.NoWrap)
        mono = QtGui.QFont("Monospace")
        mono.setStyleHint(QtGui.QFont.StyleHint.TypeWriter)
        self._edit.document().setDefaultFont(mono)
        self._edit.setReadOnly(read_only)
        self._edit.textChanged.connect(self._on_text_changed)

        # --- Preview ---
        self._preview: Optional[QtWidgets.QWidget] = None
        if show_preview:
            if HAS_WEB:
                self._preview = QWebEngineView()  # type: ignore
            else:
                fb = QtWidgets.QTextBrowser()
                fb.setOpenExternalLinks(True)
                self._preview = fb
            self._preview.setMinimumWidth(260)  # evita colapso

        # Debounce de sync preview
        self._sync_timer = QtCore.QTimer(self)
        self._sync_timer.setInterval(120)
        self._sync_timer.setSingleShot(True)
        self._edit.textChanged.connect(self._sync_timer.start)
        self._sync_timer.timeout.connect(self._sync_preview)

        # --- Toolbar de formato ---
        self._toolbar = self._build_toolbar()

        # --- Layout principal ---
        root = QtWidgets.QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.addWidget(self._toolbar)

        if self._preview:
            self._splitter = QtWidgets.QSplitter(QtCore.Qt.Orientation.Horizontal, self)
            self._splitter.setChildrenCollapsible(False)
            self._splitter.setOpaqueResize(True)
            self._splitter.addWidget(self._edit)
            self._splitter.addWidget(self._preview)
            self._splitter.setStretchFactor(0, 1)
            self._splitter.setStretchFactor(1, 1)
            root.addWidget(self._splitter)
            self._inited_sizes = False
        else:
            root.addWidget(self._edit)
            self._splitter = None

        # Persistencia (solo en la sesión actual)
        self._settings = QtCore.QSettings("israel", "portfolio-editor")

    # 50/50 la primera vez (si no había estado guardado)
    def showEvent(self, e: QtGui.QShowEvent) -> None:
        super().showEvent(e)
        if self._splitter and not getattr(self, "_inited_sizes", True):
            self._inited_sizes = True
            state = self._settings.value("html_editor_splitter_state", None)
            if state is not None:
                self._splitter.restoreState(state)
            else:
                total = max(self.width(), 800)
                w1 = total // 2
                self._splitter.setSizes([w1, total - w1])

    def closeEvent(self, e: QtGui.QCloseEvent) -> None:
        if self._splitter:
            self._settings.setValue(
                "html_editor_splitter_state", self._splitter.saveState()
            )
        super().closeEvent(e)

    # ---------------- API pública ----------------
    def set_html(self, html: str) -> None:
        old = self._edit.blockSignals(True)
        self._edit.setPlainText(html or "")
        self._edit.blockSignals(old)
        self._sync_preview()
        self.htmlChanged.emit(self.html())

    def html(self) -> str:
        return self._edit.toPlainText()

    def clear(self) -> None:
        self._edit.clear()
        self._set_preview_html("")

    def setReadOnly(self, ro: bool) -> None:  # noqa: N802
        self._edit.setReadOnly(ro)

    # ---------------- Toolbar ----------------
    def _build_toolbar(self) -> QtWidgets.QToolBar:
        tb = QtWidgets.QToolBar("Formato")
        tb.setIconSize(QtCore.QSize(16, 16))

        def add_btn(text: str, slot):
            act = QtGui.QAction(text, self)
            act.triggered.connect(slot)
            tb.addAction(act)
            return act

        add_btn("H1", lambda: self._make_header(1))
        add_btn("H2", lambda: self._make_header(2))
        add_btn("H3", lambda: self._make_header(3))
        add_btn("P", self._make_paragraph)  # ← NUEVO
        tb.addSeparator()
        add_btn("• Lista", lambda: self._make_list(ordered=False))
        add_btn("1. Lista", lambda: self._make_list(ordered=True))
        tb.addSeparator()
        add_btn("Tabla", self._make_table)

        return tb

    # ---------------- Handlers de formato ----------------
    def _make_header(self, level: int) -> None:
        cursor = self._edit.textCursor()
        sel = cursor.selectedText()
        if not sel:
            # placeholder
            html = f"<h{level}>Título</h{level}>"
            cursor.insertText(html)
        else:
            lines = self._split_selection_lines(sel)
            html_lines = [
                f"<h{level}>{line}</h{level}>" if line.strip() else "" for line in lines
            ]
            cursor.insertText("\n".join([x for x in html_lines if x != ""]))
        self._sync_preview()

    def _make_list(self, *, ordered: bool) -> None:
        cursor = self._edit.textCursor()
        sel = cursor.selectedText()
        items: List[str]
        if not sel:
            items = ["Elemento 1", "Elemento 2", "Elemento 3"]
        else:
            lines = [line.strip() for line in self._split_selection_lines(sel)]
            items = [line for line in lines if line]

        tag = "ol" if ordered else "ul"
        html = (
            f"<{tag}>\n"
            + "\n".join(
                f"  <li>{QtGui.QXmlStreamWriter().codec().toUnicode(bytes(li, 'utf-8')) if False else li}</li>"
                for li in items
            )
            + f"\n</{tag}>"
        )
        cursor.insertText(html)
        self._sync_preview()

    def _make_table(self) -> None:
        rows, ok = QtWidgets.QInputDialog.getInt(self, "Tabla", "Filas:", 3, 1, 100, 1)
        if not ok:
            return
        cols, ok = QtWidgets.QInputDialog.getInt(
            self, "Tabla", "Columnas:", 3, 1, 20, 1
        )
        if not ok:
            return
        header = (
            QtWidgets.QMessageBox.question(
                self,
                "Tabla",
                "¿Incluir cabecera (thead)?",
                QtWidgets.QMessageBox.StandardButton.Yes
                | QtWidgets.QMessageBox.StandardButton.No,
                QtWidgets.QMessageBox.StandardButton.Yes,
            )
            == QtWidgets.QMessageBox.StandardButton.Yes
        )

        parts: List[str] = ["<table>"]
        if header:
            parts.append("  <thead>")
            parts.append(
                "    <tr>"
                + "".join(f"<th>H{c + 1}</th>" for c in range(cols))
                + "</tr>"
            )
            parts.append("  </thead>")
        parts.append("  <tbody>")
        for r in range(rows):
            parts.append(
                "    <tr>"
                + "".join(f"<td>R{r + 1}C{c + 1}</td>" for c in range(cols))
                + "</tr>"
            )
        parts.append("  </tbody>")
        parts.append("</table>")

        self._edit.textCursor().insertText("\n".join(parts))
        self._sync_preview()

    def _make_paragraph(self) -> None:
        cursor = self._edit.textCursor()
        sel = cursor.selectedText()

        if not sel:
            # Sin selección: inserta un párrafo básico
            cursor.insertText("<p>Texto</p>")
            self._sync_preview()
            return

        # QPlainTextEdit.selectedText() separa párrafos con U+2029
        lines = [line.strip() for line in self._split_selection_lines(sel)]
        lines = [line for line in lines if line]  # descarta líneas vacías

        if not lines:
            cursor.insertText("<p></p>")
        else:
            # Un <p> por línea seleccionada
            html = "\n".join(f"<p>{line}</p>" for line in lines)
            cursor.insertText(html)

        self._sync_preview()

    # ---------------- Utilidades ----------------
    def _on_text_changed(self) -> None:
        self.htmlChanged.emit(self.html())

    def _sync_preview(self) -> None:
        if not self._preview:
            return
        self._set_preview_html(self.html())

    def _set_preview_html(self, html: str) -> None:
        if not self._preview:
            return
        if hasattr(self._preview, "setHtml"):
            # QWebEngineView y QTextBrowser comparten setHtml
            self._preview.setHtml(html)  # type: ignore[attr-defined]

    @staticmethod
    def _split_selection_lines(sel: str) -> List[str]:
        # QPlainTextEdit.selectedText() usa U+2029 como separador de párrafo
        return sel.replace("\u2029", "\n").splitlines()
