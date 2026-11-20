import { useRef, useState, type MouseEvent } from 'react';
import { ArrowDownRight, ArrowUpRight, MoveRight } from 'lucide-react';
import { gsap } from 'gsap';
import { useLocation, Link } from 'wouter';

const demos = [
  {
    number: '01',
    label: 'Site institucional',
    title: 'Um lugar que já recebe bem.',
    description: 'Uma presença clara para explicar o que você faz e abrir a conversa.',
    path: '/demos/institucional',
    theme: 'institutional',
    domain: 'casa-ipe.exemplo',
    tag: 'PARA NEGÓCIOS LOCAIS',
  },
  {
    number: '02',
    label: 'Site com movimento',
    title: 'A história acontece na rolagem.',
    description: 'Um site que revela ideias aos poucos, sem tirar o foco da mensagem.',
    path: '/demos/scroll',
    theme: 'motion',
    domain: 'entrelinhas.exemplo',
    tag: 'PARA MARCAS COM HISTÓRIA',
  },
  {
    number: '03',
    label: 'Plataforma de cursos',
    title: 'Aprender, uma etapa de cada vez.',
    description: 'Aulas organizadas, progresso visível e o próximo passo sempre à mão.',
    path: '/demos/cursos',
    theme: 'learning',
    domain: 'estudioaberto.exemplo',
    tag: 'PARA QUEM ENSINA',
  },
];

export function Showreel() {
  const [location, setLocation] = useLocation();
  const [opening, setOpening] = useState<string | null>(null);
  const cardsRef = useRef<Array<HTMLElement | null>>([]);

  const openDemo = (event: MouseEvent<HTMLAnchorElement>, path: string, index: number) => {
    event.preventDefault();
    if (opening) return;
    const card = cardsRef.current[index];
    if (!card) {
      setLocation(path);
      return;
    }
    setOpening(path);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setLocation(path);
      return;
    }
    const bounds = card.getBoundingClientRect();
    const expansion = card.cloneNode(true) as HTMLElement;
    expansion.setAttribute('aria-hidden', 'true');
    expansion.removeAttribute('href');
    expansion.removeAttribute('data-testid');
    expansion.classList.add('story-card-expansion');
    Object.assign(expansion.style, {
      position: 'fixed',
      zIndex: '9999',
      top: `${bounds.top}px`,
      left: `${bounds.left}px`,
      width: `${bounds.width}px`,
      height: `${bounds.height}px`,
      margin: '0',
      transformOrigin: 'top left',
      pointerEvents: 'none',
      overflow: 'hidden',
      willChange: 'transform, opacity',
    });
    document.body.appendChild(expansion);
    gsap.timeline({
      onComplete: () => {
        expansion.remove();
        setLocation(path);
      },
    }).to(expansion, {
      x: -bounds.left,
      y: -bounds.top,
      scaleX: window.innerWidth / bounds.width,
      scaleY: window.innerHeight / bounds.height,
      duration: 0.78,
      ease: 'power3.inOut',
    }).to(expansion, {
      opacity: 0.82,
      duration: 0.12,
      ease: 'power1.out',
    }, '-=0.12');
  };

  return (
    <section id="reel" className="story-reel" aria-labelledby="reel-title">
      <div className="story-reel-inner">
        <div className="story-intro">
          <div>
            <p className="story-kicker">Uma ideia puxa a outra · 01—03</p>
            <h2 id="reel-title" className="story-heading">Antes de falar,<br />dá uma <i>olhada.</i></h2>
          </div>
          <p className="story-lead">Um site pode apresentar seu negócio, contar uma história ou ensinar algo. Explore três caminhos possíveis.</p>
        </div>
        <div className="story-cards">
          {demos.map((demo, index) => (
            <Link
              key={demo.path}
              href={demo.path}
              ref={(node: HTMLElement | null) => { cardsRef.current[index] = node; }}
              onClick={(event: MouseEvent<HTMLAnchorElement>) => openDemo(event, demo.path, index)}
              className={`story-card story-card-${demo.theme} ${opening === demo.path ? 'is-opening' : ''}`}
              aria-label={`Abrir exemplo conceitual: ${demo.label}`}
              data-testid={`link-demo-${demo.theme}`}
              aria-current={location === demo.path ? 'page' : undefined}
            >
              <div className="story-card-top">
                <span className="story-card-number">{demo.number} <i>/ 03</i></span>
                <span className="story-card-open"><ArrowUpRight size={17} /></span>
              </div>
              <div className="story-browser" aria-hidden="true">
                <div className="story-browser-bar"><span /><span /><span /><small>{demo.domain}</small></div>
                <div className="story-browser-art">
                  {demo.theme === 'institutional' && <><div className="inst-nav">casa ipê <small>ESPAÇO&nbsp;&nbsp; CUIDADO&nbsp;&nbsp; CONTATO</small></div><div className="inst-scene"><small>UM ESPAÇO PARA VOCÊ</small><strong>Cuidado que<br />começa em <i>casa.</i></strong><b>Conheça o espaço <MoveRight size={12} /></b><div className="inst-sun" /><div className="inst-arch" /></div></>}
                  {demo.theme === 'motion' && <><div className="motion-label">CADERNO DE IDEIAS · 2025</div><div className="motion-shape motion-shape-one" /><div className="motion-shape motion-shape-two" /><strong>O tempo<br />também <i>cria.</i></strong><small>UM ESTÚDIO EM MOVIMENTO</small></>}
                  {demo.theme === 'learning' && <><div className="learn-bar">ESTÚDIO ABERTO <small>MINHA TRILHA</small></div><div className="learn-content"><small>CURSO · COMEÇANDO</small><strong>Desenho<br />do dia a dia</strong><span className="learn-progress"><i /></span><small>2 de 6 aulas concluídas</small></div><div className="learn-stamp">AULA<br />03</div></>}
                </div>
              </div>
              <div className="story-card-copy">
                <div><span className="story-card-tag">{demo.tag}</span><h3>{demo.label}</h3><p>{demo.description}</p></div>
                <span className="story-card-arrow"><ArrowDownRight size={19} /></span>
              </div>
            </Link>
          ))}
        </div>
        <div className="story-reel-foot">
          <span>EXEMPLOS CONCEITUAIS · NÃO SÃO TRABALHOS DE CLIENTES</span>
          <p>Uma sequência de possibilidades. Escolha por onde começar.</p>
        </div>
      </div>
    </section>
  );
}
