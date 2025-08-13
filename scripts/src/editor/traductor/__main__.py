# -*- coding: utf-8 -*-
import argparse
import os
from editor.traductor.traductor import translate_json_file, to_nllb


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="traduce",
        description="Traduce un JSON preservando estructura (NLLB, GPU si hay).",
    )
    # Posicionales (como estás usando)
    p.add_argument("infile", help="Ruta del JSON de entrada")
    p.add_argument("outfile", help="Ruta del JSON de salida")

    # Opcionales
    p.add_argument(
        "--source", "-s", default="spa_Latn", help="Idioma origen (e.g. es, spa_Latn)"
    )
    p.add_argument(
        "--target",
        "-t",
        default="eng_Latn",
        help="Idioma destino (e.g. en, eng_Latn, zh)",
    )
    p.add_argument(
        "--model",
        "-m",
        default="facebook/nllb-200-distilled-600M",
        help="Ruta o repo HF",
    )
    p.add_argument("--device", "-d", default="", help="cuda:0 / cpu (auto si vacío)")
    p.add_argument("--batch-size", "-b", type=int, default=32, help="Tamaño de lote")
    p.add_argument("--beams", type=int, default=4, help="num_beams para mejor calidad")
    p.add_argument(
        "--no-html", action="store_true", help="No parsear HTML; traduce texto tal cual"
    )
    return p


def main() -> None:
    ap = build_parser()
    args = ap.parse_args()

    src = to_nllb(args.source)
    tgt = to_nllb(args.target)

    # Validación rápida
    if not os.path.exists(args.infile):
        raise SystemExit(f"Entrada no encontrada: {args.infile}")

    translate_json_file(
        infile=args.infile,
        outfile=args.outfile,
        src_lang=src,
        tgt_lang=tgt,
        batch_size=args.batch_size,
        model_name=args.model,
        device=(args.device or None),
        num_beams=args.beams,
        parse_html=(not args.no_html),
    )
    print(f"✅ Traducción guardada en {args.outfile}")


if __name__ == "__main__":
    main()
