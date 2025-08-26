from __future__ import annotations

from typing import Dict, Iterable, Any, List, Optional
from difflib import SequenceMatcher
from PySide6 import QtCore, QtWidgets

from editor.dialogs.base_dialog import BaseDialog

Qt = QtCore.Qt


def enable_reorder(lw: QtWidgets.QListWidget) -> None:
    """
    Habilita reordenación interna por arrastrar y soltar y selección múltiple.
    """
    lw.setDragEnabled(True)
    lw.setAcceptDrops(True)
    lw.setDefaultDropAction(Qt.DropAction.MoveAction)
    lw.setDragDropMode(QtWidgets.QAbstractItemView.DragDropMode.InternalMove)
    lw.setSelectionMode(QtWidgets.QAbstractItemView.SelectionMode.ExtendedSelection)


def selected_rows(lw: QtWidgets.QListWidget) -> List[int]:
    """
    Devuelve filas seleccionadas ordenadas de menor a mayor.
    """
    return sorted({idx.row() for idx in lw.selectedIndexes()})


def move_selected(lw: QtWidgets.QListWidget, delta: int) -> None:
    """
    Mueve los ítems seleccionados delta posiciones (-1 arriba, +1 abajo).
    Conserva la selección tras mover.
    """
    rows = selected_rows(lw)
    if not rows:
        return

    # Para mover hacia abajo, procesa desde el final; hacia arriba, desde el inicio.
    iterable = reversed(rows) if delta > 0 else rows

    moved_rows: List[int] = []
    for r in iterable:
        new = r + delta
        if new < 0 or new >= lw.count():
            continue
        item = lw.takeItem(r)
        lw.insertItem(new, item)
        moved_rows.append(new)

    # Reseleccionar los elementos movidos
    lw.clearSelection()
    for r in moved_rows:
        it = lw.item(r)
        if it is not None:
            it.setSelected(True)
    if moved_rows:
        lw.setCurrentRow(moved_rows[-1])


def remove_selected(lw: QtWidgets.QListWidget) -> None:
    """
    Elimina las filas seleccionadas.
    """
    for r in reversed(selected_rows(lw)):
        lw.takeItem(r)


def set_plain_items(lw: QtWidgets.QListWidget, items: Iterable[str]) -> None:
    """
    Llena el QListWidget con una lista de textos (limpia antes).
    """
    lw.clear()
    for text in items:
        lw.addItem(text)


def add_item(
    lw: QtWidgets.QListWidget,
    text: str,
    data: Any | None = None,
    *,
    role: int = int(Qt.ItemDataRole.UserRole),
) -> QtWidgets.QListWidgetItem:
    """
    Añade un ítem con texto y (opcional) datos en UserRole (o rol indicado).
    """
    it = QtWidgets.QListWidgetItem(text)
    if data is not None:
        it.setData(role, data)
    lw.insertItem(0, it)
    return it


class CustomList(QtWidgets.QWidget):
    """
    Clase que agrupa las funcionalidades de la lista en toda la aplicacion
    """

    changed = QtCore.Signal()

    def __init__(
        self,
        parent: Optional[QtWidgets.QWidget] = None,
        *,
        dialog_cls: type[BaseDialog] | None = None,
        suggestions: List[str] = [],
    ) -> None:
        super().__init__(parent)
        self._list = QtWidgets.QListWidget()
        self._dialog_cls = dialog_cls
        self._suggestions = suggestions
        enable_reorder(self._list)
        self._btn_add = QtWidgets.QPushButton("Añadir")
        self._btn_edit = QtWidgets.QPushButton("Editar")
        self._btn_dup = QtWidgets.QPushButton("Duplicar")
        self._btn_del = QtWidgets.QPushButton("Eliminar")
        self._btn_up = QtWidgets.QPushButton("▲")
        self._btn_down = QtWidgets.QPushButton("▼")

        btn_row = QtWidgets.QGridLayout()
        btn_row.addWidget(self._btn_add, 0, 0)
        btn_row.addWidget(self._btn_edit, 0, 1)
        btn_row.addWidget(self._btn_dup, 0, 2)
        btn_row.addWidget(self._btn_del, 0, 3)
        btn_row.addWidget(self._btn_up, 0, 4)
        btn_row.addWidget(self._btn_down, 0, 5)

        self._root = QtWidgets.QVBoxLayout(self)
        self._root.addWidget(self._list)
        self._root.addLayout(btn_row)
        self._btn_add.clicked.connect(self._add)
        self._btn_edit.clicked.connect(self._edit)
        self._btn_dup.clicked.connect(self._dup)
        self._btn_del.clicked.connect(self._del)
        self._btn_up.clicked.connect(lambda: self._move(-1))
        self._btn_down.clicked.connect(lambda: self._move(+1))
        self._list.itemDoubleClicked.connect(lambda *_: self._edit())

    def _move(self, delta: int) -> None:
        move_selected(self._list, delta)
        self.changed.emit()

    def _add(self) -> None:
        if self._dialog_cls is None:
            return
        dlg = self._dialog_cls(self, suggestions=self._suggestions)
        if dlg.exec():
            it = QtWidgets.QListWidgetItem(dlg.str())
            it.setData(Qt.ItemDataRole.UserRole, dlg.value())
            self._list.addItem(it)
            self.changed.emit()

    def _dup(self) -> None:
        it = self._list.currentItem()
        if not it:
            return
        curr = it.data(Qt.ItemDataRole.UserRole) or {}
        if self._dialog_cls is None:
            return
        dlg = self._dialog_cls(self)
        try:
            dlg.set_value(curr)
        except Exception:
            pass
        if dlg.exec():
            it = QtWidgets.QListWidgetItem(dlg.str())
            it.setData(Qt.ItemDataRole.UserRole, dlg.value())
            self._list.addItem(it)
            self.changed.emit()

    def _edit(self) -> None:
        it = self._list.currentItem()
        if not it:
            return
        curr = it.data(Qt.ItemDataRole.UserRole) or {}
        if self._dialog_cls is None:
            return
        dlg = self._dialog_cls(self, self._suggestions)
        try:
            dlg.set_value(curr)
        except Exception:
            pass
        if dlg.exec():
            it.setText(dlg.str())
            it.setData(Qt.ItemDataRole.UserRole, dlg.value())
            self.changed.emit()

    def _del(self) -> None:
        remove_selected(self._list)
        self.changed.emit()

    def layout(self, /) -> QtWidgets.QLayout:
        return self._root

    def clear(self) -> None:
        self._list.clear()

    def setData(self, data: List[Dict[str, Any]]) -> None:
        self.clear()
        if self._dialog_cls is None:
            return
        dlg: BaseDialog = self._dialog_cls(self)
        for item in data:
            dlg.set_value(item)
            it = QtWidgets.QListWidgetItem(dlg.str())
            it.setData(Qt.ItemDataRole.UserRole, dlg.value())
            self._list.addItem(it)
        self.changed.emit()

    def data(self) -> List[Dict[str, Any]]:
        out = []
        for i in range(self._list.count()):
            item = self._list.item(i)
            out.append(item.data(Qt.ItemDataRole.UserRole))
        return out

    def set_suggestions(self, suggestions: List[str]) -> None:
        self._suggestions = suggestions


def _unique_casefold(seq: List[str]) -> List[str]:
    seen: set[str] = set()
    out: List[str] = []
    for s in seq or []:
        if not s:
            continue
        k = s.casefold().strip()
        if k and k not in seen:
            seen.add(k)
            out.append(s)
    return out


class _FuzzyProxy(QtCore.QSortFilterProxyModel):
    """
    Proxy para filtrar/ordenar sugerencias:
      - prioriza 'contains' (case-insensitive),
      - luego similitud fuzzy (SequenceMatcher),
      - excluye elementos ya presentes en la lista de tecnologías.
    """

    def __init__(self, parent: Optional[QtCore.QObject] = None, threshold: float = 0.6):
        super().__init__(parent)
        self._query = ""
        self._threshold = float(threshold)
        self._exclude: set[str] = set()  # valores casefold() a excluir
        self.setFilterCaseSensitivity(QtCore.Qt.CaseSensitivity.CaseInsensitive)

    def setQuery(self, text: str) -> None:
        self._query = (text or "").strip()
        self.invalidateFilter()
        self.invalidate()

    def setExclude(self, items_casefold: set[str]) -> None:
        self._exclude = set(items_casefold or set())
        self.invalidateFilter()
        self.invalidate()

    def _score(self, candidate: str) -> float:
        q = self._query.casefold()
        c = (candidate or "").casefold()
        if not q:
            return 0.0
        if q in c:
            return 2.0  # prioridad top para 'contains'
        return SequenceMatcher(None, q, c).ratio()

    def filterAcceptsRow(
        self,
        source_row: int,
        source_parent: QtCore.QModelIndex | QtCore.QPersistentModelIndex,
    ) -> bool:
        del source_parent  # no se usa; evita avisos estáticos

        idx = self.sourceModel().index(source_row, 0, QtCore.QModelIndex())
        text = str(
            self.sourceModel().data(idx, QtCore.Qt.ItemDataRole.DisplayRole) or ""
        )
        if text.casefold().strip() in self._exclude:
            return False
        if not self._query:
            return True
        if self._query.casefold() in text.casefold():
            return True
        return self._score(text) >= self._threshold

    def lessThan(
        self,
        left: QtCore.QModelIndex | QtCore.QPersistentModelIndex,
        right: QtCore.QModelIndex | QtCore.QPersistentModelIndex,
    ) -> bool:
        # OJO: left/right son índices del **modelo fuente**; no mapear.
        a = str(self.sourceModel().data(left, QtCore.Qt.ItemDataRole.DisplayRole) or "")
        b = str(
            self.sourceModel().data(right, QtCore.Qt.ItemDataRole.DisplayRole) or ""
        )

        sa = self._score(a)
        sb = self._score(b)

        # Queremos los de mayor score primero -> devuelve True si 'left' debe ir
        # "antes" por tener mayor score (orden "descendente" por score).
        if sa != sb:
            return sa > sb
        return a.casefold() < b.casefold()


class TechList(QtWidgets.QWidget):
    """
    Lista de tecnologías con entrada y sugerencias:
      - Dedup case-insensitive
      - Completer con contains + fuzzy
      - El popup NO muestra lo ya añadido

    API:
      set_value(list[str]), value() -> list[str]
      set_suggestions(list[str])
      set_fuzzy_threshold(float)
    """

    changed = QtCore.Signal()

    def __init__(
        self,
        parent: Optional[QtWidgets.QWidget] = None,
        *,
        fuzzy_threshold: float = 0.6,
    ) -> None:
        super().__init__(parent)

        self._suggestions: List[str] = []
        self._fuzzy_threshold = float(fuzzy_threshold)

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

        # Modelo base + proxy fuzzy
        self._model = QtCore.QStringListModel(self)
        self._proxy = _FuzzyProxy(self, threshold=self._fuzzy_threshold)
        self._proxy.setSourceModel(self._model)

        # Completer
        self._completer = QtWidgets.QCompleter(self)
        self._completer.setModel(self._proxy)
        self._completer.setCaseSensitivity(QtCore.Qt.CaseSensitivity.CaseInsensitive)
        self._completer.setCompletionMode(
            QtWidgets.QCompleter.CompletionMode.PopupCompletion
        )
        self._completer.setMaxVisibleItems(12)
        if hasattr(self._completer, "setFilterMode"):
            self._completer.setFilterMode(QtCore.Qt.MatchFlag.MatchContains)
        self._edit.setCompleter(self._completer)

        # Conexiones
        self._btn_add.clicked.connect(self._on_add)
        self._edit.returnPressed.connect(self._on_add)
        self._btn_edit.clicked.connect(self._on_edit)
        self._btn_del.clicked.connect(self._on_delete)
        self._btn_up.clicked.connect(
            lambda: (move_selected(self._list, -1), self._after_mutation())
        )
        self._btn_down.clicked.connect(
            lambda: (move_selected(self._list, +1), self._after_mutation())
        )
        self._list.itemChanged.connect(self._after_mutation)
        self._list.itemSelectionChanged.connect(self._emit_changed)

        # Filtrado dinámico del popup conforme se escribe
        self._edit.textEdited.connect(self._on_text_edited)

        # Mostrar sugerencias al enfocar (si hay catálogo)
        self._edit.installEventFilter(self)

        # Inicializar exclusiones del proxy
        self._refresh_proxy_exclude()

    # ---------------- API pública ----------------

    def set_value(self, items: List[str] | None) -> None:
        self._list.clear()
        for t in items or []:
            if t:
                add_item(self._list, str(t))
        self._refresh_proxy_exclude()
        self._emit_changed()

    def value(self) -> List[str]:
        return [self._list.item(i).text() for i in range(self._list.count())]

    def set_suggestions(self, items: List[str]) -> None:
        # 1) dedup case-insensitive
        self._suggestions = _unique_casefold(items or [])
        # 2) actualizar modelo
        self._model.setStringList(self._suggestions)
        # 3) re-filtrar según texto actual
        self._proxy.setQuery(self._edit.text())
        # 4) excluir lo ya presente
        self._refresh_proxy_exclude()

    def set_fuzzy_threshold(self, thr: float) -> None:
        self._fuzzy_threshold = float(thr)
        self._proxy._threshold = self._fuzzy_threshold
        self._proxy.invalidate()

    # --------------- Internos / helpers ---------------

    def eventFilter(self, obj: QtCore.QObject, ev: QtCore.QEvent) -> bool:
        if obj is self._edit and ev.type() == QtCore.QEvent.Type.FocusIn:
            if self._suggestions:
                self._proxy.setQuery(self._edit.text())
                self._completer.complete()
        return super().eventFilter(obj, ev)

    def _emit_changed(self) -> None:
        self.changed.emit()

    def _current_items_keyset(self) -> set[str]:
        return {
            self._list.item(i).text().casefold().strip()
            for i in range(self._list.count())
            if self._list.item(i) and self._list.item(i).text()
        }

    def _refresh_proxy_exclude(self) -> None:
        self._proxy.setExclude(self._current_items_keyset())

    def _after_mutation(self) -> None:
        self._refresh_proxy_exclude()
        self._emit_changed()

    def _canonical(self, text: str) -> str:
        t = (text or "").strip()
        if not t:
            return t
        for s in self._suggestions:
            if s.casefold() == t.casefold():
                return s
        return t

    def _exists(self, text: str) -> bool:
        norm = (text or "").casefold().strip()
        return norm in self._current_items_keyset()

    def _current_popup_choice(self) -> Optional[str]:
        """
        Devuelve el texto actualmente seleccionado en el popup del completer,
        sin mapear índices (evita 'index from wrong model').
        """
        # Opción directa: el propio QCompleter te da el string actual.
        s = self._completer.currentCompletion()
        if isinstance(s, str) and s:
            return s

        # Fallback por si currentCompletion() no tuviera valor aún:
        popup = self._completer.popup()
        if popup and popup.isVisible():
            idx = popup.currentIndex()
            if idx.isValid():
                # Leer el texto directamente del completionModel del completer.
                model = self._completer.completionModel()
                val = model.data(idx, QtCore.Qt.ItemDataRole.DisplayRole)
                if isinstance(val, str) and val:
                    return val
        return None

    def _on_text_edited(self, text: str) -> None:
        self._proxy.setQuery(text)
        if self._suggestions:
            self._completer.complete()

    def _on_add(self) -> None:
        raw = self._edit.text().strip()
        popup_choice = self._current_popup_choice()
        can = popup_choice or self._canonical(raw)
        if not can:
            return
        if self._exists(can):
            # Selecciona el existente
            key = can.casefold().strip()
            for i in range(self._list.count()):
                if self._list.item(i).text().casefold().strip() == key:
                    self._list.setCurrentRow(i)
                    break
            return
        add_item(self._list, can)
        self._after_mutation()
        self._edit.clear()

    def _on_edit(self) -> None:
        it = self._list.currentItem()
        if not it:
            return
        txt, ok = QtWidgets.QInputDialog.getText(
            self, "Editar tecnología", "Nombre:", text=it.text()
        )
        if not ok:
            return
        pop = self._current_popup_choice()
        can = pop or self._canonical(txt)
        if not can:
            return
        it.setText(can)
        self._after_mutation()

    def _on_delete(self) -> None:
        remove_selected(self._list)
        self._after_mutation()
