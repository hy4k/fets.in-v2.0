import fs from 'fs';
import { examCategories, mockExams, testimonials, faqData, centers } from './src/data/siteData.js';

let sql = '';

const escapeSql = (str) => {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str === 'number') return str;
  if (Array.isArray(str)) return "ARRAY[" + str.map(escapeSql).join(',') + "]";
  if (typeof str === 'object') return "'" + JSON.stringify(str).replace(/'/g, "''") + "'::jsonb";
  return "'" + String(str).replace(/'/g, "''") + "'";
};

examCategories.forEach(c => {
  sql += `INSERT INTO public.exam_categories (id, name, short_desc, color, exams) VALUES (${escapeSql(c.id)}, ${escapeSql(c.name)}, ${escapeSql(c.shortDesc)}, ${escapeSql(c.color)}, ${escapeSql(c.exams)}) ON CONFLICT DO NOTHING;\n`;
});

mockExams.forEach(m => {
  sql += `INSERT INTO public.mock_exams (id, name, category, description, duration, questions, price, difficulty, features) VALUES (${escapeSql(m.id)}, ${escapeSql(m.name)}, ${escapeSql(m.category)}, ${escapeSql(m.description)}, ${escapeSql(m.duration)}, ${escapeSql(String(m.questions))}, ${escapeSql(m.price)}, ${escapeSql(m.difficulty)}, ${escapeSql(m.features)}) ON CONFLICT DO NOTHING;\n`;
});

testimonials.forEach(t => {
  sql += `INSERT INTO public.testimonials (name, role, text, rating, avatar) VALUES (${escapeSql(t.name)}, ${escapeSql(t.role)}, ${escapeSql(t.text)}, ${escapeSql(t.rating)}, ${escapeSql(t.avatar)});\n`;
});

faqData.forEach(f => {
  sql += `INSERT INTO public.faq_data (q, a) VALUES (${escapeSql(f.q)}, ${escapeSql(f.a)});\n`;
});

centers.forEach(c => {
  sql += `INSERT INTO public.centers (id, name, address, phone, email, hours, images, directions, map_url) VALUES (${escapeSql(c.id)}, ${escapeSql(c.name)}, ${escapeSql(c.address)}, ${escapeSql(c.phone)}, ${escapeSql(c.email)}, ${escapeSql(c.hours)}, ${escapeSql(c.images)}, ${escapeSql(c.directions)}, ${escapeSql(c.mapUrl)}) ON CONFLICT DO NOTHING;\n`;
});

fs.writeFileSync('seed.sql', sql);
console.log('SQL generated to seed.sql!');
