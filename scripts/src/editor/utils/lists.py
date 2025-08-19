from __future__ import annotations

from typing import Iterable, Any, List
from PySide6 import QtCore, QtWidgets

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
    lw.addItem(it)
    return it


def insert_item(
    row: int,
    lw: QtWidgets.QListWidget,
    text: str,
    data: Any | None = None,
    *,
    role: int = int(Qt.ItemDataRole.UserRole),
) -> QtWidgets.QListWidgetItem:
    """
    Inserta un ítem en la fila indicada con texto y (opcional) datos.
    """
    return QtWidgets.QListWidgetItem(text)
