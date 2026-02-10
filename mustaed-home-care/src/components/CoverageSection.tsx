import { useState } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';

const coverageAreas = {
  'شمال الرياض': [
    'حي الملقا', 'حي الياسمين', 'حي النرجس', 'حي الصحافة', 'حي العقيق',
    'حي الوادي', 'حي الربيع', 'حي النخيل', 'حي الغدير', 'حي الازدهار',
  ],
  'وسط الرياض': [
    'حي العليا', 'حي السليمانية', 'حي الملز', 'حي النزهة', 'حي المربع',
    'حي الفاخرية', 'حي المعذر', 'حي الورود', 'حي الرحمانية',
  ],
  'شرق الرياض': [
    'حي الروضة', 'حي الريان', 'حي قرطبة', 'حي الخليج', 'حي النهضة',
    'حي المونسية', 'حي الجنادرية', 'حي القادسية', 'حي اليرموك',
  ],
  'غرب الرياض': [
    'حي العريجاء', 'حي لبن', 'حي الشفا', 'حي السويدي', 'حي ظهرة لبن',
    'حي الهدا', 'حي نمار', 'حي الفيحاء', 'حي طويق',
  ],
  'جنوب الرياض': [
    'حي الحزم', 'حي المنصورة', 'حي الدار البيضاء', 'حي الشفا', 'حي العزيزية',
    'حي المروج', 'حي البديعة', 'حي أم الحمام',
  ],
};

const CoverageSection = () => {
  const [openRegion, setOpenRegion] = useState<string | null>('شمال الرياض');

  return (
    <section id="coverage" className="section-padding">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-primary font-semibold mb-4">نطاق التغطية</span>
          <h2 className="section-title">نغطي جميع أحياء الرياض</h2>
          <p className="section-subtitle">
            خدماتنا متوفرة في جميع مناطق الرياض - اختر منطقتك
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-4">
            {Object.entries(coverageAreas).map(([region, neighborhoods]) => (
              <div
                key={region}
                className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50"
              >
                <button
                  className="w-full flex items-center justify-between p-5 text-right hover:bg-muted/50 transition-colors"
                  onClick={() => setOpenRegion(openRegion === region ? null : region)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-lg font-bold text-foreground">{region}</span>
                    <span className="text-sm text-muted-foreground">({neighborhoods.length} حي)</span>
                  </div>
                  {openRegion === region ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                
                {openRegion === region && (
                  <div className="px-5 pb-5 animate-fade-in">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-3 border-t border-border">
                      {neighborhoods.map((neighborhood, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl text-sm"
                        >
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-foreground">{neighborhood}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoverageSection;
