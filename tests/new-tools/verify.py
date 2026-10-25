"""Independent PDF validation with pypdf, Pillow and Poppler; no application code."""
import json
import subprocess
import sys
from pathlib import Path
from statistics import mean
from pypdf import PdfReader
from PIL import Image

case, output, source = sys.argv[1:]
reader = PdfReader(output)
assert not reader.is_encrypted, 'Output still encrypted'
assert len(reader.pages) == 3
evidence = {'case': case, 'pages': 3, 'encrypted': False}

if case.startswith('unlock'):
    original = PdfReader(source)
    if original.is_encrypted:
        assert original.decrypt('fixture-open') or original.decrypt('fixture-owner')
    for number, (before, after) in enumerate(zip(original.pages, reader.pages), 1):
        assert before.extract_text() == after.extract_text(), number
        assert list(before.mediabox) == list(after.mediabox)
        assert list(before.cropbox) == list(after.cropbox)
        assert before.rotation == after.rotation
    assert reader.get_fields()['customer']['/V'] == 'Alice Example'
    evidence.update(selectableTextPreserved=True, filledFormPreserved=True, pageGeometryPreserved=True)
elif case.startswith('brightness'):
    rotated = 'rotated' in case
    for n, page in enumerate(reader.pages):
        expected = (480, 360) if rotated and n == 0 else (320, 420) if rotated and n == 1 else (360, 480)
        assert (float(page.mediabox.width), float(page.mediabox.height)) == expected
        assert not (page.extract_text() or '').strip()
        assert len(page.images) >= 1
    image = reader.pages[2].images[0].image.convert('RGB')
    sample = image.crop((100, 420, 240, 560))
    actual = mean([pixel[0] for pixel in sample.getdata()])
    brightness, contrast = (-20, -25) if 'dark' in case else (0,0) if 'neutral' in case else (20,25)
    factor = 1 + contrast / (25 if contrast >= 0 else 100)
    expected = max(0, min(255, round((89 - 128) * factor + 128 + brightness * 2.55)))
    assert abs(actual - expected) <= 3, (actual, expected)
    # The same transformed gray patch must exist on every page, including rotated/cropped ones.
    for page in reader.pages:
        pixels = page.images[0].image.convert('RGB').getdata()
        assert sum(1 for pixel in pixels if all(abs(c - expected) <= 3 for c in pixel)) > 20000
    assert reader.get_fields() is None
    evidence.update(rasterizedAllPages=True, selectableText=False, expectedGray=expected, actualGray=round(actual,2), pageGeometryVerified=True)
elif case.startswith('editor'):
    texts = [page.extract_text() for page in reader.pages]
    assert 'VISIBLE NOTE' in texts[0]
    assert 'DELETED NOTE' not in ''.join(texts)
    assert 'SECOND PAGE' in texts[1]
    assert all(f'Original selectable page {i}' in texts[i-1] for i in range(1,4))
    if case == 'editor-flattened':
        assert not reader.get_fields()
        assert 'Alice Example' in texts[0]
        assert not any(a.get_object().get('/Subtype') == '/Widget' for p in reader.pages for a in p.get('/Annots', []))
    else:
        assert reader.get_fields()['customer']['/V'] == 'Alice Example'
    original = PdfReader(source)
    for before, after in zip(original.pages, reader.pages):
        assert list(before.cropbox) == list(after.cropbox)
        assert before.rotation == after.rotation
    prefix = str(Path(output).with_suffix('')) + '-render'
    subprocess.run(['pdftoppm','-f','1','-singlefile','-cropbox','-scale-to-x','360','-scale-to-y','480','-png',output,prefix], check=True, capture_output=True)
    image = Image.open(prefix+'.png').convert('RGB')
    # The added blue text must render at its visual position, including all rotations.
    w, h = image.size
    region = image.crop((int(.08*w), int(.22*h), int(.8*w), int(.33*h)))
    assert sum(1 for r,g,b in region.getdata() if b > 140 and r < 70 and g < 140) > 40
    if case == 'editor':
        yellow = image.getpixel((80,360))
        assert yellow[0] > 240 and yellow[1] > 240 and 130 < yellow[2] < 200, yellow
        # Whiteout covers the visible original heading, while extraction above proves it is not redacted.
        covered = image.crop((38,72,315,88))
        assert min(sum(pixel) for pixel in covered.getdata()) > 730
        # Distinct vector outline shapes appear in both selected regions.
        for box in [(33,235,130,315), (195,235,290,315)]:
            assert sum(1 for r,g,b in image.crop(box).getdata() if b > r + 50) > 100
    if case == 'editor-flattened':
        covered = image.crop((38,155,275,177))
        assert min(sum(pixel) for pixel in covered.getdata()) > 730
    evidence.update(originalTextPreserved=True, formFieldsFlattened=case == 'editor-flattened', overlayTextVerified=True, deletedElementAbsent=True, whiteoutNotRedaction=True, geometryPreserved=True, rendered=str(prefix+'.png'))
else:
    raise AssertionError(case)
print(json.dumps(evidence, indent=2))
