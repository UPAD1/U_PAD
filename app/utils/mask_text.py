# app/utils/mask_text.py

from PIL import Image, ImageDraw

def mask_sensitive_info_on_image(image_path, ocr_blocks, findings, output_path):
    image = Image.open(image_path)
    draw = ImageDraw.Draw(image)

    for finding in findings:
        quote = finding["quote"]
        for block in ocr_blocks:
            if quote in block["text"]:
                x1, y1, x2, y2 = block["bbox"]
                draw.rectangle([x1, y1, x2, y2], fill="black")

    image.save(output_path)
    return output_path
