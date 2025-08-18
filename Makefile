dev_app:
	@cd scripts && \
    loop "󰙵 App" "QTWEBENGINE_CHROMIUM_FLAGS='--disable-gpu --disable-gpu-compositing' QT_OPENGL=software QT_QUICK_BACKEND=software PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python poetry run editor" && \
    cd ..
