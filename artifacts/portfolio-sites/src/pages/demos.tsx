import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, CirclePlay, Menu, MoveDown } from 'lucide-react';
import { Link } from 'wouter';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const courseLessons = [
  'Comece pelo que você vê',
  'Desenho sem pressão',
  'Luz e sombra na rua',
  'Uma cena, três formas',
  'Cor com o que tem por perto',
  'Seu caderno em movimento',
];

function DemoReturn({ sequence }: { sequence: string }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  return (
    <div className="demo-return">
      <Link href="/" className="demo-back" data-testid="link-voltar-portfolio"><ArrowLeft size={15} /> Voltar ao portfólio de Davi</Link>
      <span>EXEMPLO CONCEITUAL <i>·</i> {sequence}</span>
    </div>
  );
}

export function InstitutionalDemo() {
  return (
    <div className="demo-site demo-institutional">
      <DemoReturn sequence="01 / 03" />
      <header className="inst-header">
        <a className="inst-brand" href="#inicio">CASA IPÊ<span>·</span></a>
        <nav aria-label="Menu Casa Ipê"><a href="#casa">O espaço</a><a href="#cuidado">Nosso jeito</a><a href="#visita">Como chegar</a><a href="#visita" className="inst-cta">Marque uma visita <ArrowUpRight size={14} /></a></nav>
        <button className="inst-mobile-menu" aria-label="Menu" onClick={() => document.getElementById('cuidado')?.scrollIntoView({ behavior: 'smooth' })}><Menu size={20} /></button>
      </header>
      <main>
        <section id="inicio" className="inst-hero">
          <div className="inst-hero-copy"><p className="demo-overline">UM ESPAÇO DE CUIDADO EM CAMPINAS</p><h1>Um lugar para<br />voltar a <i>si.</i></h1><p>Na Casa Ipê, cada detalhe convida você a desacelerar. Um espaço acolhedor para cuidar do corpo e encontrar seu próprio ritmo.</p><a href="#casa" className="inst-link">Conheça a Casa Ipê <ArrowRight size={16} /></a><span className="inst-index">UM EXEMPLO DE SITE INSTITUCIONAL</span></div>
          <div className="inst-hero-art" aria-label="Ilustração abstrata de um espaço acolhedor"><div className="inst-art-sun" /><div className="inst-art-window" /><div className="inst-art-plant"><i /><i /><i /></div><span>LUZ DA MANHÃ · 09:14</span></div>
          <span className="inst-side-note">CUIDADO, SEM PRESSA — CASA IPÊ</span>
        </section>
        <section id="casa" className="inst-intro">
          <p className="demo-overline">UM ESPAÇO FEITO PARA RECEBER</p><h2>Você não precisa<br />ter tudo <i>resolvido.</i></h2><p>Aqui, a conversa começa com escuta. Conheça quem cuida de você, entenda como funciona e escolha o melhor momento para vir.</p>
        </section>
        <section id="cuidado" className="inst-details"><div><span>01 — O ESPAÇO</span><h2>Um pouco de<br />calma no dia.</h2></div><p>Ambientes simples, luz natural e tempo para você. Este exemplo mostra como um site pode apresentar um lugar, seu jeito de cuidar e as informações que ajudam alguém a dar o primeiro passo.</p><a href="#visita">Veja como chegar <MoveDown size={15} /></a></section>
        <section id="visita" className="inst-contact"><div><p className="demo-overline">A CASA IPÊ É UM NEGÓCIO INVENTADO</p><h2>Quer conhecer<br />um jeito de <i>cuidar?</i></h2><p>Este botão é demonstrativo. Em um projeto real, leva ao contato ou agendamento do negócio.</p></div><a href="mailto:contato@seudominio.com.br?subject=Quero%20conhecer%20um%20site" className="inst-cta">Falar com a Casa Ipê <ArrowUpRight size={16} /></a></section>
      </main>
      <footer className="inst-footer"><span>CASA IPÊ · EXEMPLO CONCEITUAL</span><Link href="/demos/scroll">Próxima ideia: um site com movimento <ArrowRight size={14} /></Link></footer>
    </div>
  );
}

export function ScrollDemo() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return;
    const root = document.querySelector('.demo-scroll');
    if (!root) return;
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.scroll-reveal').forEach((item) => {
        gsap.fromTo(item, { y: 38, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.85, ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 82%', toggleActions: 'play none none reverse' },
        });
      });
      gsap.to('.scroll-orb', {
        yPercent: 28, rotate: 18, ease: 'none',
        scrollTrigger: { trigger: '.scroll-hero', start: 'top top', end: 'bottom top', scrub: 0.7 },
      });
    }, root);
    return () => context.revert();
  }, []);
  return (
    <div className="demo-site demo-scroll">
      <DemoReturn sequence="02 / 03" />
      <header className="scroll-header"><a href="#top">ENTRELINHAS<span>®</span></a><span>UM ESTÚDIO DE IDEIAS</span><a href="#fim">CONTATO <ArrowUpRight size={14} /></a></header>
      <main id="top">
        <section className="scroll-hero"><div className="scroll-orb" /><div className="scroll-hero-copy"><p>UM EXEMPLO DE SITE COM MOVIMENTO · 02—03</p><h1>Tem coisa que<br />só aparece<br /><i>com o tempo.</i></h1><a href="#capitulo-um">Role para descobrir <MoveDown size={15} /></a></div><span className="scroll-hero-mark">E<br />—<br />L</span></section>
        <section id="capitulo-um" className="scroll-chapter scroll-reveal"><span>CAPÍTULO 01 / IDEIA</span><h2>Primeiro,<br />uma pergunta.</h2><p>O que acontece quando o site não entrega tudo de uma vez? A rolagem pode guiar o olhar, dar espaço para uma frase e transformar a leitura em percurso.</p><div className="scroll-lineart"><span>MENOS PRESSA</span><i /><span>MAIS PRESENÇA</span></div></section>
        <section className="scroll-band"><div className="scroll-reveal"><span>CAPÍTULO 02 / RITMO</span><h2>Movimento<br />com <i>motivo.</i></h2><p>Animação não é enfeite. Ela pode marcar uma mudança de assunto, destacar um detalhe ou deixar a navegação mais clara.</p></div><div className="scroll-blocks" aria-hidden="true"><i /><i /><i /></div></section>
        <section className="scroll-end scroll-reveal"><p>CAPÍTULO 03 / CHEGADA</p><h2>Uma história<br />também precisa<br />de um <i>próximo passo.</i></h2><a href="#fim">Vamos conversar <ArrowRight size={16} /></a></section>
        <section className="scroll-next" id="fim"><span>FIM DESTE PERCURSO · EXEMPLO CONCEITUAL</span><Link href="/demos/cursos">Próxima ideia: aprender por etapas <ArrowRight size={15} /></Link></section>
      </main>
    </div>
  );
}

export function CoursesDemo() {
  const [completed, setCompleted] = useState<number[]>([0, 1]);
  const [activeLesson, setActiveLesson] = useState<number | null>(2);
  const [notice, setNotice] = useState('');
  const toggleLesson = (index: number) => {
    setCompleted((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index]);
    setNotice(completed.includes(index) ? 'Aula removida do seu progresso.' : 'Aula marcada como concluída.');
  };
  const progress = Math.round(completed.length / courseLessons.length * 100);
  return (
    <div className="demo-site demo-courses">
      <DemoReturn sequence="03 / 03" />
      <header className="course-header"><Link href="/" className="course-logo">ESTÚDIO <i>ABERTO</i></Link><span>UM EXEMPLO DE PLATAFORMA DE CURSOS</span><a href="#trilha">MINHA TRILHA <ArrowUpRight size={14} /></a></header>
      <main className="course-layout" id="trilha">
        <aside className="course-sidebar"><p>SEU ESPAÇO</p><a className="active" href="#trilha">Minha trilha</a><a href="#aulas">Todas as aulas</a><div className="course-side-note">Aprender não é<br />uma corrida.</div><Link href="/demos/institucional">Voltar ao começo <ArrowLeft size={13} /></Link></aside>
        <section className="course-main">
          <div className="course-welcome"><p>OLÁ, PESSOA CURIOSA</p><h1>Um desenho<br />de cada vez.</h1><span>Seu espaço para praticar sem pressa.</span></div>
          <div className="course-progress-card"><div className="course-progress-top"><div><p>SUA TRILHA</p><h2>Desenho do dia a dia</h2></div><strong>{progress}%</strong></div><div className="course-progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div><p className="course-progress-caption">{completed.length} de {courseLessons.length} aulas concluídas <span>·</span> Você pode mudar seu progresso quando quiser.</p></div>
          <div className="course-lessons" id="aulas"><div className="course-lesson-heading"><div><p>O SEU PERCURSO</p><h2>Aulas do curso</h2></div><span>6 ETAPAS</span></div>
            {courseLessons.map((lesson, index) => {
              const done = completed.includes(index);
              return <article key={lesson} className={`course-lesson ${activeLesson === index ? 'selected' : ''}`}>
                <button className="course-lesson-main" onClick={() => { setActiveLesson(activeLesson === index ? null : index); setNotice(''); }} aria-expanded={activeLesson === index} aria-controls={`lesson-detail-${index}`} data-testid={`button-lesson-${index}`}>
                  <span className={`course-lesson-check ${done ? 'done' : ''}`}>{done ? <Check size={14} /> : <span>{String(index + 1).padStart(2, '0')}</span>}</span>
                  <span><small>AULA {String(index + 1).padStart(2, '0')}</small><strong>{lesson}</strong></span>
                  <span className="course-lesson-time">{index === 0 ? '4 min' : index === 1 ? '6 min' : '5 min'}</span>
                  <ArrowRight size={15} />
                </button>
                {activeLesson === index && <div id={`lesson-detail-${index}`} className="course-lesson-detail">
                  <div className="lesson-texture"><CirclePlay size={25} /><span>LEITURA E PRÁTICA</span></div>
                  <div><p>Esta etapa propõe uma atividade simples para você observar e desenhar no seu ritmo. O conteúdo é um roteiro de demonstração; não há vídeo ou aula gravada nesta página.</p><button onClick={() => toggleLesson(index)} className={`course-complete ${done ? 'completed' : ''}`} data-testid={`button-complete-${index}`}>{done ? <><Check size={14} /> Concluída · desfazer</> : <>Marcar como concluída <Check size={14} /></>}</button></div>
                </div>}
              </article>;
            })}
            <p className="course-notice" role="status">{notice || 'Seu progresso fica nesta página enquanto ela estiver aberta.'}</p>
          </div>
          <div className="course-demo-note">EXEMPLO CONCEITUAL · AULAS E PROGRESSO SÃO DEMONSTRATIVOS</div>
        </section>
      </main>
      <footer className="course-footer"><span>ESTÚDIO ABERTO · EXEMPLO CONCEITUAL</span><Link href="/demos/institucional">Recomeçar o passeio <ArrowLeft size={14} /></Link></footer>
    </div>
  );
}
