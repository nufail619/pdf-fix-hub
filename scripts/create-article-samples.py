"""Generate intentionally public, synthetic article examples. No personal data."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image,ImageDraw,ImageFont
out=Path('public/samples');out.mkdir(parents=True,exist_ok=True)
def make(name,pages):
 c=canvas.Canvas(str(out/name),invariant=1)
 for label,w,h,angle in pages:
  c.setPageSize((w,h));c.setPageRotation(angle);c.setFont('Helvetica',16);c.drawString(40,min(h-70,250),label);c.setFont('Helvetica',11);c.drawString(40,80,'Synthetic PDF Fix Hub practice file - no personal information.');c.showPage()
 c.save()
make('editing-practice.pdf',[('Invoice Total 125.00',420,595,0),('APPENDIX PAGE 2',595,420,90),('KEEP PAGE 3',360,480,0)])
make('page-order-practice.pdf',[(f'ORIGINAL PAGE {n}',420,595,0) for n in range(1,9)])
make('print-practice.pdf',[('PORTRAIT - check margins at actual size',595,842,0),('LANDSCAPE - check orientation',842,595,0)])
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',28)
image=Image.new('RGB',(800,1000),(75,75,75));d=ImageDraw.Draw(image);d.text((55,120),'Dark scan practice',(25,25,25),font=font);d.text((55,190),'Invoice total: 125.00',(30,30,30),font=font)
image.save(out/'dark-scan.jpg');c=canvas.Canvas(str(out/'dark-scan-practice.pdf'),pagesize=(400,500),invariant=1);c.drawImage(str(out/'dark-scan.jpg'),0,0,400,500);c.save()
image=Image.new('RGB',(600,800),'white');d=ImageDraw.Draw(image);d.text((40,120),'Receipt A - JPG',fill='black',font=font);image.save(out/'receipt.jpg',quality=90)
image=Image.new('RGB',(800,600),'white');d=ImageDraw.Draw(image);d.rectangle((60,120,700,430),outline='blue',width=5);d.text((100,210),'Diagram B - PNG',fill='black',font=font);image.save(out/'diagram.png')
pdfmetrics.registerFont(TTFont('SampleEmbedded','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
c=canvas.Canvas(str(out/'embedded-font-practice.pdf'),invariant=1);c.setFont('SampleEmbedded',18);c.drawString(50,700,'Embedded Sample Text');c.drawString(50,660,'KEEP EMBEDDED FONT');c.save()
print('Created synthetic public PDF and image practice files.')
