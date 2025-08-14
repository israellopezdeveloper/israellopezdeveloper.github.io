# src/editor/summarizer/__main__.py
import argparse
from editor.summarizer.summarizer import summarize_json_file


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="resume",
        description="Resume textos dentro de un JSON manteniendo su estructura.",
    )
    p.add_argument("infile", help="JSON de entrada")
    p.add_argument("outfile", help="JSON de salida")
    p.add_argument("--model", default="csebuetnlp/mT5_multilingual_XLSum")
    p.add_argument("--device", default="")
    p.add_argument("--batch-size", type=int, default=8)
    p.add_argument(
        "--short-threshold",
        type=int,
        default=140,
        help="No resumir si longitud < N caracteres",
    )
    p.add_argument("--min-length", type=int, default=60)
    p.add_argument("--max-length", type=int, default=200)
    p.add_argument("--ratio", type=float, default=None, help="0<r<=1 (ej: 0.3 ≈ 30%)")
    p.add_argument(
        "--no-html",
        action="store_true",
        help="No analizar HTML; tratarlo como texto plano",
    )
    return p


def main() -> None:
    ap = build_parser()
    args = ap.parse_args()

    summarize_json_file(
        infile=args.infile,
        outfile=args.outfile,
        model_name=args.model,
        device=(args.device or None),
        batch_size=args.batch_size,
        short_threshold=args.short_threshold,
        min_length=args.min_length,
        max_length=args.max_length,
        ratio=args.ratio,
        keep_html=(not args.no_html),
    )
    print(f"✅ Resumen guardado en {args.outfile}")


if __name__ == "__main__":
    main()
