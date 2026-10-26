import sys,json
from pathlib import Path
from pypdf import PdfReader
from PIL import Image
r=PdfReader(sys.argv[2]);kind=sys.argv[1];texts=[p.extract_text() or '' for p in r.pages]
if kind=='native':
 assert len(r.pages)==3 and 'Invoice Total 99.00' in texts[0] and 'Invoice Total 125.00' not in texts[0]
 assert 'APPENDIX PAGE 2' in texts[1] and 'KEEP PAGE 3' in texts[2]
 assert [int(p.get('/Rotate',0)) for p in r.pages]==[0,90,0]
 assert [(float(p.mediabox.width),float(p.mediabox.height)) for p in r.pages]==[(420,595),(420,595),(360,480)]
 # No opaque covering operation: the saved active text no longer contains the old amount.
 assert b'125.00' not in r.pages[0].get_contents().get_data()
if kind=='delete':assert 'Invoice Total 125.00' not in texts[0] and 'Synthetic PDF Fix Hub' in texts[0]
if kind=='embedded':assert 'Sample Text' in texts[0] and 'Embedded Sample Text' not in texts[0] and 'KEEP EMBEDDED FONT' in texts[0]
if kind=='scan':
 assert 'SCAN NOTE' in texts[0] and len(r.pages[0].images)>0 and 'Invoice total' not in texts[0]
 original=PdfReader('public/samples/dark-scan-practice.pdf')
 assert r.pages[0].images[0].image.tobytes()==original.pages[0].images[0].image.tobytes()
if kind=='formatted':
 assert 'First line' in texts[0] and 'Second line' in texts[0]
 assert 'Courier-BoldOblique' in str(r.pages[0]['/Resources']['/Font'].get_object()) or any('Courier-BoldOblique' in str(v.get_object()) for v in r.pages[0]['/Resources']['/Font'].get_object().values())
if kind=='form':assert 'Edited' in texts[0] and any(v.get('/V')=='Alice Example' for v in (r.get_fields() or {}).values())
if kind=='rotated':assert 'Changed' in texts[0] and 'Original page 1' not in texts[0]
print(json.dumps({'case':kind,'pages':len(r.pages),'text':texts,'fields':list((r.get_fields() or {}).keys())}))
