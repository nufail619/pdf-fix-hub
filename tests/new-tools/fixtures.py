"""Real deterministic input documents; credentials below are public test fixtures."""
from pathlib import Path
from reportlab.pdfgen import canvas
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject

ROOT = Path('test-results/new-tools-fixtures')
ROOT.mkdir(parents=True, exist_ok=True)
c = canvas.Canvas(str(ROOT / 'sample.pdf'), pagesize=(360, 480))
for n in range(1, 4):
    c.setFillColorRGB(0, 0, 0)
    c.drawString(40, 400, f'Original selectable page {n}')
    c.setFillColorRGB(.35, .35, .35)
    c.rect(40, 180, 100, 100, fill=1, stroke=0)
    if n == 1:
        c.acroForm.textfield(name='customer', value='Alice Example', x=40, y=300, width=240, height=25)
    c.showPage()
c.save()

for name, rotation in [('rotated', 90), ('upside-down', 180), ('counterclockwise', 270)]:
    writer = PdfWriter(clone_from=ROOT / 'sample.pdf')
    writer.pages[0].rotate(rotation)
    writer.pages[1].cropbox.lower_left = (20, 30)
    writer.pages[1].cropbox.upper_right = (340, 450)
    writer.write(ROOT / f'{name}.pdf')

for algorithm in ['RC4-40', 'RC4-128', 'AES-128', 'AES-256-R5', 'AES-256']:
    writer = PdfWriter(clone_from=ROOT / 'sample.pdf')
    writer.encrypt('fixture-open', 'fixture-owner', algorithm=algorithm)
    writer.write(ROOT / f'{algorithm}.pdf')
writer = PdfWriter(clone_from=ROOT / 'sample.pdf')
writer.encrypt('', 'fixture-owner', algorithm='AES-256')
writer.write(ROOT / 'empty-password.pdf')
data = (ROOT / 'AES-128.pdf').read_bytes()
assert b'/Filter /Standard' in data
(ROOT / 'unsupported.pdf').write_bytes(data.replace(b'/Filter /Standard', b'/Filter /Adobe.PubSec'))
(ROOT / 'broken.pdf').write_bytes(b'This is not a valid PDF')
print('Created multipage, form, cropped/rotated, five encryption algorithms, empty-password and unsupported fixtures.')
