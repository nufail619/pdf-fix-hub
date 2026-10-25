"""Validate actual downloaded bytes using independent parsers, not file extensions."""
import io, json, sys, zipfile
from pathlib import Path
from pypdf import PdfReader
from PIL import Image, ImageChops

kind, filename, fixture_dir = sys.argv[1:]
path = Path(filename)
root = Path(fixture_dir)
evidence = {'case': kind, 'filename': path.name, 'bytes': path.stat().st_size}

def pdf(source, count, order=None):
    reader = PdfReader(source, strict=True)
    assert len(reader.pages) == count, (len(reader.pages), count)
    if order:
        for page, n in zip(reader.pages, order):
            assert f'sample page {n}' in page.extract_text(), page.extract_text()
    return reader

def image(data, fmt, size):
    img = Image.open(io.BytesIO(data))
    assert img.format == fmt, img.format
    img.load()
    assert img.size == size, img.size
    rgb = img.convert('RGB')
    # Verify the expected red rectangle and white background, not just a nonempty file.
    assert rgb.getpixel((75, size[1] - 300))[0] > 220
    assert rgb.getpixel((75, size[1] - 300))[1] < 40
    assert min(rgb.getpixel((size[0] - 15, 15))) > 240

def form_value(img, scale):
    # Inside the field, away from its border: the filled value must be painted.
    region = img.convert('RGB').crop(tuple(int(v * scale) for v in (45, 134, 190, 153)))
    dark = sum(max(pixel) < 160 for pixel in region.getdata())
    assert dark > 40 * scale, f'Filled form text disappeared: only {dark} dark pixels'

if kind.startswith('pdf-to-jpg') or kind.startswith('pdf-to-png'):
    fmt, ext = ('JPEG', 'jpg') if 'jpg' in kind else ('PNG', 'png')
    if kind.endswith('form'):
        img = Image.open(path); img.load()
        assert img.format == fmt and img.size == (360, 480)
        form_value(img, 1)
        evidence.update(format=fmt, formValueVisible=True)
    elif kind.endswith('single'):
        image(path.read_bytes(), fmt, (360, 480))
        assert path.suffix == f'.{ext}'
        evidence.update(format=fmt, dimensions=[360, 480])
    elif kind.endswith('rotated'):
        img = Image.open(path); img.load()
        assert img.format == fmt and img.size == (480, 360)
        evidence.update(format=fmt, dimensions=list(img.size))
    elif kind.endswith('print'):
        img = Image.open(path); img.load()
        assert img.format == fmt and img.size == (1500, 2000)
        evidence.update(format=fmt, dimensions=list(img.size))
    else:
        with zipfile.ZipFile(path) as z:
            assert z.testzip() is None
            names = [f'sample-page-{n}.{ext}' for n in range(1, 4)]
            assert z.namelist() == names, z.namelist()
            for name in names: image(z.read(name), fmt, (360, 480))
            evidence.update(entries=names, format=fmt, dimensions=[360, 480])
elif kind == 'split-pdf':
    with zipfile.ZipFile(path) as z:
        assert z.testzip() is None
        assert z.namelist() == ['sample-1-2.pdf', 'sample-3.pdf']
        pdf(io.BytesIO(z.read('sample-1-2.pdf')), 2, [1, 2])
        pdf(io.BytesIO(z.read('sample-3.pdf')), 1, [3])
        evidence['entries'] = {'sample-1-2.pdf': 2, 'sample-3.pdf': 1}
elif kind == 'pdf-to-text':
    text = path.read_text('utf-8')
    for n in range(1, 4): assert f'PDF Fix Hub sample page {n}' in text
    assert text.index('sample page 1') < text.index('sample page 3')
    evidence['text'] = text
else:
    counts = {'merge-pdf': 4, 'extract-pdf-pages': 2, 'remove-pdf-pages': 2,
              'jpg-to-pdf': 2, 'png-to-pdf': 1, 'add-blank-page-to-pdf': 4,
              'flatten-pdf': 1, 'flatten-pdf-full': 1, 'word-to-pdf': 1}
    orders = {'extract-pdf-pages': [1, 3], 'remove-pdf-pages': [1, 3],
              'reorder-pdf-pages': [3, 1, 2], 'rotate-pdf': [1, 2, 3],
              'add-page-numbers-to-pdf': [1, 2, 3], 'add-text-to-pdf': [1, 2, 3],
              'watermark-pdf': [1, 2, 3], 'crop-pdf': [1, 2, 3]}
    reader = pdf(path, counts.get(kind, 3), orders.get(kind))
    evidence['pages'] = len(reader.pages)
    text = [p.extract_text() for p in reader.pages]
    evidence['text'] = text
    if kind == 'merge-pdf':
        assert 'second page 1' in text[-1]
    if kind in ('jpg-to-pdf', 'png-to-pdf'):
        assert all(tuple(p.mediabox[2:]) == (240, 160) for p in reader.pages)
        assert all(len(list(p.images)) == 1 for p in reader.pages)
    if kind == 'rotate-pdf': assert all(p.rotation == 90 for p in reader.pages)
    if kind == 'add-page-numbers-to-pdf':
        for n, s in enumerate(text, 1): assert f'{n} / 3' in s
    if kind == 'add-text-to-pdf': assert 'TEST ADDED TEXT' in text[1] and 'TEST ADDED TEXT' not in text[0]
    if kind == 'add-blank-page-to-pdf':
        assert not text[1].strip() and 'sample page 1' in text[0] and 'sample page 2' in text[2]
    if kind == 'add-margin-to-pdf':
        assert all(tuple(p.mediabox[2:]) == (400, 520) for p in reader.pages)
    if kind == 'add-margin-to-pdf-zero':
        assert all(tuple(p.mediabox[2:]) == (360, 480) for p in reader.pages)
    if kind == 'watermark-pdf-zero':
        for page in reader.pages:
            states = page['/Resources']['/ExtGState']
            assert any(s.get_object().get('/ca') == 0 for s in states.values())
    if kind == 'add-text-to-pdf-zero':
        positions = []
        reader.pages[1].extract_text(visitor_text=lambda text, cm, tm, font, size: positions.append((text, tm[:])) if 'TEST ADDED TEXT' in text else None)
        assert len(positions) == 1 and positions[0][1][4:6] == [0, 0], positions
    if kind == 'watermark-pdf': assert all('CONFIDENTIAL' in s for s in text)
    if kind.startswith('flatten-pdf'):
        assert not reader.get_fields()
        assert not any(a.get_object().get('/Subtype') == '/Widget' for p in reader.pages for a in p.get('/Annots', []))
        if kind == 'flatten-pdf': assert 'Alice Example' in text[0]
        else: form_value(list(reader.pages[0].images)[0].image, 2)
    if kind.startswith('compress-pdf'):
        assert path.stat().st_size <= (root / 'sample.pdf').stat().st_size
        evidence['originalBytes'] = (root / 'sample.pdf').stat().st_size
    if kind == 'crop-pdf':
        assert abs(float(reader.pages[0].cropbox.width) - (360 - 20 * 72 / 25.4)) < .01
        assert float(reader.pages[1].cropbox.width) == 360
    if kind == 'grayscale-pdf':
        for page in reader.pages:
            img = list(page.images)[0].image.convert('RGB')
            r, g, b = img.split()
            assert ImageChops.difference(r, g).getextrema()[1] <= 2
            assert ImageChops.difference(g, b).getextrema()[1] <= 2
    if kind == 'word-to-pdf':
        for s in ['PDF Fix Hub Word sample', 'Selectable Word text', 'A second paragraph']: assert s in text[0]
    if kind == 'edit-pdf-metadata':
        assert reader.metadata.title == 'Verified title' and reader.metadata.author == 'QA Author'
    if kind == 'edit-pdf-metadata-clear':
        assert not reader.metadata.title and not reader.metadata.author

print(json.dumps(evidence))
