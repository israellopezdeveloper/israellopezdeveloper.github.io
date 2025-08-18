# src/editor/actions/factory.py
from __future__ import annotations
from typing import Dict, Callable, Optional
from PySide6 import QtGui, QtWidgets


def _connect(action: QtGui.QAction, slot: Optional[Callable]) -> None:
    if slot:
        action.triggered.connect(slot)  # type: ignore[arg-type]


def create_menu_actions(main: QtWidgets.QMainWindow) -> Dict[str, QtGui.QAction]:
    """
    Crea acciones comunes y las conecta a slots del MainWindow si existen:
    - on_new, on_open, on_save, on_save_as, on_exit
    - on_translate, on_summarize
    Retorna un dict para registrarlas/poner en menús o toolbars.
    """
    A: Dict[str, QtGui.QAction] = {}

    def act(text: str, shortcut: str = "", status: str = "") -> QtGui.QAction:
        a = QtGui.QAction(text, main)
        if shortcut:
            a.setShortcut(shortcut)
        if status:
            a.setStatusTip(status)
        return a

    A["new"] = act("&New", "Ctrl+N", "Nuevo documento")
    A["open"] = act("&Open…", "Ctrl+O", "Abrir JSON…")
    A["save"] = act("&Save", "Ctrl+S", "Guardar")
    A["save_as"] = act("Save &As…", "Ctrl+Shift+S", "Guardar como…")
    A["exit"] = act("E&xit", "Ctrl+Q", "Salir")

    A["translate"] = act("&Translate", "Ctrl+T", "Traducir contenido")
    A["summarize"] = act("&Summarize", "Ctrl+R", "Resumir contenido")

    # Conexiones si existen los métodos
    _connect(A["new"], getattr(main, "on_new", None))
    _connect(A["open"], getattr(main, "open_file", None))
    _connect(A["save"], getattr(main, "save_file", None))
    _connect(A["save_as"], getattr(main, "save_file_as", None))
    _connect(A["exit"], getattr(main, "on_exit", None))

    _connect(A["translate"], getattr(main, "action_translate", None))
    _connect(A["summarize"], getattr(main, "action_summarize", None))

    return A


def create_button_actions(main: QtWidgets.QMainWindow) -> Dict[str, QtGui.QAction]:
    """
    Crea acciones comunes y las conecta a slots del MainWindow si existen:
    - on_new, on_open, on_save, on_save_as, on_exit
    - on_translate, on_summarize
    Retorna un dict para registrarlas/poner en menús o toolbars.
    """
    A: Dict[str, QtGui.QAction] = {}

    def act(text: str, status: str = "") -> QtGui.QAction:
        a = QtGui.QAction(text, main)
        if status:
            a.setToolTip(status)
        return a

    A["new"] = act("📃", "Nuevo documento")
    A["open"] = act("📂", "Abrir JSON…")
    A["save"] = act("💾", "Guardar")

    A["translate"] = act("󰗊", "Traducir contenido")
    A["summarize"] = act("", "Resumir contenido")

    # Conexiones si existen los métodos
    _connect(A["new"], getattr(main, "on_new", None))
    _connect(A["open"], getattr(main, "open_file", None))
    _connect(A["save"], getattr(main, "save_file", None))

    _connect(A["translate"], getattr(main, "action_translate", None))
    _connect(A["summarize"], getattr(main, "action_summarize", None))

    return A
