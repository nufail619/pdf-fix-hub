"""Deterministic, independently generated browser-test inputs.

Requires reportlab, pypdf, Pillow and python-docx in the test environment.
"""
from pathlib import Path
from reportlab.pdfgen import canvas
from pypdf import PdfReader, PdfWriter
from PIL import Image, ImageDraw
from docx import Document

ROOT = Path('test-results/pdf-tools-fixtures')
ROOT.mkdir(parents=True, exist_ok=True)

for name, count in [('sample', 3), ('second', 1)]:
    c = canvas.Canvas(str(ROOT / f'{name}.pdf'), pagesize=(360, 480), pageCompression=0)
    c.setTitle('Original title')
    for n in range(1, count + 1):
        c.setFillColorRGB(0, 0, 0)
        c.drawString(40, 400, f'PDF Fix Hub {name} page {n}')
        c.setFillColorRGB(1, 0, 0)
        c.rect(40, 250, 100, 100, fill=1)
        c.showPage()
    c.save()

c = canvas.Canvas(str(ROOT / 'form.pdf'), pagesize=(360, 480))
c.drawString(40, 400, 'PDF Fix Hub form')
c.acroForm.textfield(name='customer', value='Alice Example', x=40, y=320, width=240, height=30)
c.showPage()
c.save()

writer = PdfWriter(clone_from=ROOT / 'sample.pdf')
writer.pages[0].rotate(90)
writer.write(ROOT / 'rotated.pdf')

image = Image.new('RGB', (240, 160), 'white')
ImageDraw.Draw(image).rectangle((30, 30, 180, 130), fill='red')
image.save(ROOT / 'photo.jpg')
image.save(ROOT / 'photo.jpeg')
image.save(ROOT / 'photo.png')
doc = Document()
doc.add_heading('PDF Fix Hub Word sample', 0)
doc.add_paragraph('Selectable Word text with bold and italic content.')
doc.add_paragraph('A second paragraph survives conversion.')
doc.save(ROOT / 'sample.docx')
(ROOT / 'broken.pdf').write_bytes(b'This is not a PDF file')
print(f'Created PDF, filled form, rotated PDF, JPG/JPEG/PNG and DOCX fixtures in {ROOT}')
