import type { Student } from './types';

const OPENINGS = [
  '一个充实的学期即将画上句号。', '翻开你的成长档案，老师看到了你留下的一个个坚实脚印。',
  '你就像班级里的一颗小星星，在老师眼里一直在默默发光。', '回顾这一学期，你的成长和进步大家都看在眼里。',
  '岁月缱绻，葳蕤生香，你在这个学期里又向前迈出了坚实的一步。', '在老师眼里，你是一个聪明、可爱而又有潜力的孩子。',
];
const CLOSINGS = [
  '展望未来，愿你像雄鹰一样自信大胆地拥抱天空，加油！', '愿你带着本学期的收获，在新的旅程中继续乘风破浪！',
  '愿你眼里有光、心中有爱，保持热爱，奔赴山海！', '星光不问赶路人，时光不负有心人，期待看到更加出色的你！',
];
const TAG_SENTENCES: Record<string, string[]> = {
  学习之星:['在学习上，你展现了出色的逻辑思维，面对难题总能沉下心寻找突破口。'],勤奋努力:['你是一只默默努力的蜗牛，每一滴汗水都算数，坚持下去，花儿一定会开。'],思维活跃:['课堂上总能看到你积极思考的身影，你的发言常常给大家带来启发。'],热爱阅读:['书籍是你最好的朋友，这份静气和不断拓展的知识面会让你受益终生。'],书写工整:['你那工整清秀的字迹，体现了认真细致的学习态度。'],计算能手:['你对数字有着敏锐的感觉，计算又快又准，解决问题时充满自信。'],
  战胜粗心:['你的脑瓜很灵，只要再多一份细心，学习表现一定会更加稳定。'],基础薄弱:['学习如同盖房子，希望你多花时间夯实基础，遇到不懂的地方及时提问。'],作业拖拉:['若能做到今日事今日毕，进一步提高完成作业的效率，你会收获更多从容。'],字迹潦草:['希望你能静下心坚持练字，让每一次书写都成为认真态度的体现。'],
  乐于助人:['你有一颗金子般的心，总在同学需要时伸出援手，让班集体更加温暖。'],懂礼貌:['你待人彬彬有礼，一声真诚的问候总能让老师感到温暖。'],人缘极好:['你性格随和，懂得倾听和分享，同学们都很喜欢与你相处。'],阳光开朗:['你是班级里的开心果，灿烂的笑容常常把快乐带给身边的人。'],诚实守信:['你诚实守信、勇于担当，这份可贵的品质比成绩更加值得珍视。'],温柔细腻:['你心思细腻，懂得照顾他人的感受，和你相处是一件舒服的事情。'],
  爱告状:['遇到同学间的小摩擦时，希望你先尝试沟通解决，在理解与宽容中成长。'],脾气急躁:['你性格直爽，如果遇事能多一份耐心和包容，会更容易获得伙伴的理解。'],有些娇气:['面对小挫折时，希望你勇敢一些，在一次次尝试中练就更强大的内心。'],胆小害羞:['你像一朵安静的小花，希望今后能更自信地表达想法，让大家看到你的光芒。'],
  守纪模范:['你有着很强的自律能力，无论课堂还是集体活动，都能自觉遵守规则。'],责任感强:['作为班级的一员，你认真负责，交给你的任务总能让老师放心。'],讲究卫生:['你能把自己的物品整理得井井有条，良好的生活习惯值得肯定。'],惜时如金:['你有良好的时间观念，能够有序安排学习和生活。'],午休捣乱:['希望你在午休时保持安静，学会尊重大家共同的休息时间。'],挑食浪费:['希望你珍惜粮食、均衡饮食，以更健康的身体迎接每天的学习。'],上课说话:['思维活跃是优点，如果能把精彩的话留在发言环节，课堂收获会更多。'],上课走神:['如果上课时能更加专心投入，你一定会发现知识世界里的更多乐趣。'],坐不住:['活泼好动是你的天性，也期待你在课堂上学会静心，让智慧更好地生长。'],丢三落四:['希望你养成整理和检查的习惯，让学习与生活变得更加有序。'],
  运动健将:['运动场上总能看到你矫健的身影，强健的体魄是学习的坚实基础。'],才艺小星:['你多才多艺，总能用自己的才华给班级带来惊喜。'],劳动光荣:['每次集体劳动你都积极参与、不怕辛苦，劳动的身影格外美丽。'],小主持人:['你的表达清晰、台风自然，在大家面前总能自信地展示风采。'],科技达人:['你对科技有着浓厚兴趣，动手探索时专注而富有创造力。'],坚持练字:['希望你每天坚持练字，让一笔一画都见证自己的耐心和成长。'],少看手机:['希望你合理安排电子产品使用时间，多到户外感受自然和生活。'],阅读打卡:['希望你坚持每天阅读，在书海中积蓄知识与成长的力量。'],多做家务:['期待你主动承担力所能及的家务，成为家人的贴心小帮手。'],注意安全:['无论在家还是外出，都要把安全放在首位，学会更好地保护自己。'],
};
const NEGATIVE = new Set(['战胜粗心','基础薄弱','作业拖拉','字迹潦草','爱告状','脾气急躁','有些娇气','胆小害羞','午休捣乱','挑食浪费','上课说话','上课走神','坐不住','丢三落四']);
const DEFAULT_POSITIVE=['学习之星','勤奋努力','思维活跃','热爱阅读','书写工整','乐于助人','懂礼貌','阳光开朗','诚实守信','守纪模范','责任感强'];
const GOLDENS=['你的每一点进步，老师都看在眼里、记在心上。','只要继续保持这份热情，未来一定值得期待。','每一份认真付出都会积蓄成向上的力量。','老师相信你会在一次次尝试中遇见更好的自己。','你的潜力远比想象中更大，继续勇敢前行吧。'];
const MOTTOS: Record<Student['type'],string[]> = {
 优秀生:['胸怀大志，脚踏实地','志向远大，脚步坚定','追求卓越，永不止步','百尺竿头，更进一步','精进不休，日新月异'],
 中等生:['快马加鞭，勇往直前','坚定信念，行稳致远','持之以恒，必有收获','脚踏实地，仰望星空','珍惜时光，努力向上'],
 后进生:['只要开始，永远不晚','现在努力，为时未晚','不怕起点低，就怕不努力','千里之行，始于足下','每天进步一点点'],
 未分类:['心怀梦想，砥砺前行','相信自己，勇敢前行','把握当下，创造未来','坚持不懈，未来可期','愿你眼里有光，脚下有路'],
};
const memory={openings:new Set<string>(),closings:new Set<string>(),tags:new Map<string,Set<string>>()};

const shuffle=<T,>(items:T[])=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const punct=(s:string)=>/[。！？；…]$/.test(s)?s:s.replace(/[，,]$/,'')+'。';
function pickUnused(items:string[],used:Set<string>){let available=items.filter(x=>!used.has(x));if(!available.length){used.clear();available=items}const value=available[Math.floor(Math.random()*available.length)];used.add(value);return value}
export function resetGenerationMemory(){memory.openings.clear();memory.closings.clear();memory.tags.clear()}

export function generateMotto(student:Student){const items=MOTTOS[student.type]||MOTTOS['未分类'];return items[Math.floor(Math.random()*items.length)]}

export function generateComment(student:Student,targetLength=150,showStudentName=true){
 const min=Math.min(120,Math.max(100,targetLength-30));const max=Math.min(170,Math.max(120,targetLength+20));
 const opening=`${showStudentName&&student.name?`${student.name}同学，`:''}${punct(pickUnused(OPENINGS,memory.openings))}`;const closing=punct(pickUnused(CLOSINGS,memory.closings));
 let tags=[...new Set(Object.values(student.tags).flat())];if(!tags.length)tags=shuffle(DEFAULT_POSITIVE).slice(0,2);
 const positives=tags.filter(t=>!NEGATIVE.has(t));const negatives=tags.filter(t=>NEGATIVE.has(t)).slice(0,1);const parts:string[]=[];let length=opening.length+closing.length;const transitions=shuffle(['同时，','此外，','而且，','另外，']);
 for(const tag of positives){const choices=TAG_SENTENCES[tag];if(!choices||length>=max-20)continue;const used=memory.tags.get(tag)||new Set<string>();memory.tags.set(tag,used);const sentence=punct(pickUnused(choices,used));const prefix=parts.length&&transitions.length?transitions.shift()!:'';if(length+prefix.length+sentence.length<=max){parts.push(prefix+sentence);length+=prefix.length+sentence.length}}
 for(const tag of negatives){const choices=TAG_SENTENCES[tag];if(!choices)continue;const used=memory.tags.get(tag)||new Set<string>();memory.tags.set(tag,used);const sentence='不过，'+punct(pickUnused(choices,used));if(length+sentence.length<=max){parts.push(sentence);length+=sentence.length}}
 for(const golden of shuffle(GOLDENS)){if(length>=min)break;const sentence=punct(golden);if(length+sentence.length<=max){parts.push(sentence);length+=sentence.length}}
 if(!parts.length)parts.push(punct(shuffle(GOLDENS)[0]));return opening+parts.join('')+closing;
}

export function demoAiTransform(student:Student,mode:'polish'|'rewrite',tone:string,targetLength:number,showStudentName=true){const base=mode==='rewrite'?generateComment(student,targetLength,showStudentName):(student.comment||generateComment(student,targetLength,showStudentName));const prefix=tone==='正式稳重'?'本学期，':tone==='亲切自然'?'亲爱的同学，':'';return `${prefix}${base}`.slice(0,500)}
