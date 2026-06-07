with open('index.html', 'r') as f:
    content = f.read()

# Wait! The text content is not visible!
# I notice that `.reveal-up` has `opacity: 0` and translates up. The JS is supposed to add `.visible` to `.reveal-up` to show it.
# Let's ensure the javascript is correct.

# I previously accidentally corrupted the script tag. Let's fix it properly.
import re

js_to_replace = """<script>
const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');}),{threshold:0.12});
document.querySelectorAll('.reveal-up,.section-label').forEach(el=>obs.observe(el));
const cObs=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const el=entry.target,target=+el.dataset.target,suffix=el.dataset.suffix||'+';
    let s=0;const step=target/60;
    const iv=setInterval(()=>{s=Math.min(s+step,target);el.textContent=Math.floor(s)+suffix;if(s>=target)clearInterval(iv);},16);
    cObs.unobserve(el);

},{threshold:0.5});
document.querySelectorAll('.stat-num[data-target]').forEach(el=>cObs.observe(el));
</script>"""

js_correct = """<script>
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting) e.target.classList.add('visible');
  });
}, {threshold: 0.1});
document.querySelectorAll('.reveal-up, .section-label').forEach(el => obs.observe(el));

const cObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.target;
    const suffix = el.dataset.suffix || '+';
    let s = 0;
    const step = target / 60;
    const iv = setInterval(() => {
      s = Math.min(s + step, target);
      el.textContent = Math.floor(s) + suffix;
      if (s >= target) clearInterval(iv);
    }, 16);
    cObs.unobserve(el);
  });
}, {threshold: 0.5});
document.querySelectorAll('.stat-num[data-target]').forEach(el => cObs.observe(el));
</script>"""

content = re.sub(r'<script>.*?</script>', js_correct, content, flags=re.DOTALL)

with open('index.html', 'w') as f:
    f.write(content)
