const fs = require('fs');
const content = fs.readFileSync('components/StockInfoModal.tsx', 'utf8');

const newSelect = `<select
                    value={formData.volumeMl || ''}
                    onChange={(e) => handleChange('volumeMl', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg outline-none text-slate-200"
                  >
                    <option value="">Not Applicable</option>
                    <option value="50000">50,000ml (50L Keg)</option>
                    <option value="30000">30,000ml (30L Keg)</option>
                    <option value="1000">1000ml (1L Jug)</option>
                    <option value="750">750ml (Wine Bottle)</option>
                    <option value="745">745ml (Quart Beer)</option>
                    <option value="700">700ml (Spirits)</option>
                    <option value="570">570ml (Pint)</option>
                    <option value="500">500ml</option>
                    <option value="340">340ml (12oz Glass)</option>
                    <option value="330">330ml (Bottle)</option>
                    <option value="250">250ml (Large Wine)</option>
                    <option value="200">200ml (7oz Glass)</option>
                    <option value="150">150ml (Small Wine)</option>
                    <option value="30">30ml (Double Measure)</option>
                    <option value="15">15ml (Single Measure)</option>
                  </select>`;

const regex = /<select[\s\S]*?name="volumeMl"[\s\S]*?<\/select>|<select\s+value=\{formData\.volumeMl[\s\S]*?<\/select>/;
const newContent = content.replace(regex, newSelect);
fs.writeFileSync('components/StockInfoModal.tsx', newContent);
