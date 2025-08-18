dev_app:
	@rm -rf scripts/CV.base.en.json
	@cd scripts && \
    loop "󰙵 App" "rm -rf CV.base.en.json CV.base.s.json; QTWEBENGINE_CHROMIUM_FLAGS='--disable-gpu --disable-gpu-compositing' QT_OPENGL=software QT_QUICK_BACKEND=software PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python poetry run editor" && \
    cd ..
