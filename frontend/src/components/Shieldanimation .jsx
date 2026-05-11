import React from 'react';

const RINGS = [
  { size: 290, dur: '3.6s', dir: 'normal',  anim: 'iidps-spinY',  color: '#00f0ff', shadow: 'rgba(0,240,255,0.95)', dotSize: 14, extraDots: true  },
  { size: 268, dur: '2.9s', dir: 'reverse', anim: 'iidps-spinX',  color: '#0099ff', shadow: 'rgba(0,153,255,0.95)', dotSize: 12, topBottom: true  },
  { size: 248, dur: '4.1s', dir: 'normal',  anim: 'iidps-spinD1', color: '#00ffd0', shadow: 'rgba(0,255,208,0.9)',  dotSize: 11 },
  { size: 228, dur: '2.6s', dir: 'reverse', anim: 'iidps-spinD2', color: '#78b4ff', shadow: 'rgba(120,180,255,0.9)',dotSize: 10 },
  { size: 208, dur: '3.3s', dir: 'normal',  anim: 'iidps-spinD3', color: '#00dcb4', shadow: 'rgba(0,220,180,0.85)', dotSize: 9  },
  { size: 188, dur: '2.2s', dir: 'reverse', anim: 'iidps-spinD4', color: '#50a0ff', shadow: 'rgba(80,160,255,0.8)', dotSize: 8  },
  { size: 168, dur: '3.9s', dir: 'normal',  anim: 'iidps-spinD5', color: '#00f0ff', shadow: 'rgba(0,240,255,0.75)', dotSize: 7  },
  { size: 148, dur: '2.4s', dir: 'reverse', anim: 'iidps-spinD6', color: '#64c8ff', shadow: 'rgba(100,200,255,0.7)',dotSize: 6  },
];

const ShieldAnimation = ({ size = 320 }) => {
  const s = size / 320;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: size }}>
      <style>{`
        @keyframes iidps-spinY  { from{transform:rotateX(90deg) rotateZ(0deg)}   to{transform:rotateX(90deg) rotateZ(360deg)}  }
        @keyframes iidps-spinX  { from{transform:rotateY(90deg) rotateZ(0deg)}   to{transform:rotateY(90deg) rotateZ(360deg)}  }
        @keyframes iidps-spinD1 { from{transform:rotateX(65deg) rotateY(45deg) rotateZ(0deg)}   to{transform:rotateX(65deg) rotateY(45deg) rotateZ(360deg)}  }
        @keyframes iidps-spinD2 { from{transform:rotateX(65deg) rotateY(-45deg) rotateZ(0deg)}  to{transform:rotateX(65deg) rotateY(-45deg) rotateZ(360deg)} }
        @keyframes iidps-spinD3 { from{transform:rotateX(30deg) rotateY(70deg) rotateZ(0deg)}   to{transform:rotateX(30deg) rotateY(70deg) rotateZ(360deg)}  }
        @keyframes iidps-spinD4 { from{transform:rotateX(50deg) rotateY(20deg) rotateZ(0deg)}   to{transform:rotateX(50deg) rotateY(20deg) rotateZ(360deg)}  }
        @keyframes iidps-spinD5 { from{transform:rotateX(75deg) rotateY(90deg) rotateZ(0deg)}   to{transform:rotateX(75deg) rotateY(90deg) rotateZ(360deg)}  }
        @keyframes iidps-spinD6 { from{transform:rotateX(20deg) rotateY(50deg) rotateZ(0deg)}   to{transform:rotateX(20deg) rotateY(50deg) rotateZ(360deg)}  }
        @keyframes iidps-shield-glow {
          0%,100% { filter: drop-shadow(0 0 8px rgba(0,240,255,0.7)) drop-shadow(0 0 24px rgba(0,140,255,0.4)); }
          50%     { filter: drop-shadow(0 0 22px rgba(0,240,255,1))   drop-shadow(0 0 55px rgba(0,140,255,0.8)); }
        }
        @keyframes iidps-core-breath {
          0%,100% { opacity:0.5; transform:translate(-50%,-50%) scale(1);    }
          50%     { opacity:1;   transform:translate(-50%,-50%) scale(1.16);  }
        }
        @keyframes iidps-outer-breath {
          0%,100% { opacity:0.3; transform:translate(-50%,-50%) scale(1);    }
          50%     { opacity:0.7; transform:translate(-50%,-50%) scale(1.06);  }
        }
      `}</style>

      <div style={{
        position: 'relative',
        width: size, height: size,
        perspective: `${700 * s}px`,
        transformStyle: 'preserve-3d',
      }}>

        {RINGS.map((r) => {
          const d  = r.size * s;
          const half = d / 2;
          const ds = r.dotSize * s;
          const border = d < 200 * s ? `${1 * s}px` : d < 240 * s ? `${1.5 * s}px` : `${2 * s}px`;

          return (
            <div key={r.anim} style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: d, height: d,
              marginLeft: -half, marginTop: -half,
              borderRadius: '50%',
              border: `${border} solid ${r.color.replace(')', ',0.75)').replace('rgb', 'rgba')}`,
              boxShadow: `0 0 ${12*s}px ${r.color}88, inset 0 0 ${10*s}px ${r.color}22`,
              animation: `${r.anim} ${r.dur} linear infinite ${r.dir}`,
              transformStyle: 'preserve-3d',
            }}>
              {r.topBottom ? (
                <>
                  <div style={{ position:'absolute', borderRadius:'50%', width:ds, height:ds, top:-ds/2, left:`calc(50% - ${ds/2}px)`, background:r.color, boxShadow:`0 0 ${12*s}px ${4*s}px ${r.shadow}` }}/>
                  <div style={{ position:'absolute', borderRadius:'50%', width:ds, height:ds, bottom:-ds/2, left:`calc(50% - ${ds/2}px)`, background:r.color, boxShadow:`0 0 ${12*s}px ${4*s}px ${r.shadow}` }}/>
                  <div style={{ position:'absolute', borderRadius:'50%', width:ds*0.5, height:ds*0.5, top:`calc(50% - ${ds*0.25}px)`, left:-ds*0.25, background:r.color, opacity:0.38 }}/>
                  <div style={{ position:'absolute', borderRadius:'50%', width:ds*0.5, height:ds*0.5, top:`calc(50% - ${ds*0.25}px)`, right:-ds*0.25, background:r.color, opacity:0.38 }}/>
                </>
              ) : (
                <>
                  <div style={{ position:'absolute', borderRadius:'50%', width:ds, height:ds, top:`calc(50% - ${ds/2}px)`, left:-ds/2, background:r.color, boxShadow:`0 0 ${12*s}px ${4*s}px ${r.shadow}` }}/>
                  <div style={{ position:'absolute', borderRadius:'50%', width:ds, height:ds, top:`calc(50% - ${ds/2}px)`, right:-ds/2, background:r.color, boxShadow:`0 0 ${12*s}px ${4*s}px ${r.shadow}` }}/>
                  {r.extraDots && <>
                    <div style={{ position:'absolute', borderRadius:'50%', width:ds*0.5, height:ds*0.5, top:-ds*0.25, left:`calc(50% - ${ds*0.25}px)`, background:r.color, opacity:0.4 }}/>
                    <div style={{ position:'absolute', borderRadius:'50%', width:ds*0.5, height:ds*0.5, bottom:-ds*0.25, left:`calc(50% - ${ds*0.25}px)`, background:r.color, opacity:0.4 }}/>
                  </>}
                </>
              )}
            </div>
          );
        })}

        {/* Outer ambient glow */}
        <div style={{
          position:'absolute', top:'50%', left:'50%',
          width: 240*s, height: 240*s,
          borderRadius:'50%',
          background:'radial-gradient(circle,rgba(0,100,255,0.07) 0%,transparent 65%)',
          animation:'iidps-outer-breath 3.5s ease-in-out infinite',
          transform:'translate(-50%,-50%)',
          zIndex:4,
        }}/>

        {/* Core halo */}
        <div style={{
          position:'absolute', top:'50%', left:'50%',
          width: 150*s, height: 150*s,
          borderRadius:'50%',
          background:'radial-gradient(circle,rgba(0,240,255,0.22) 0%,rgba(0,80,200,0.1) 45%,transparent 70%)',
          animation:'iidps-core-breath 2.6s ease-in-out infinite',
          transform:'translate(-50%,-50%)',
          zIndex:5,
        }}/>

        {/* Shield */}
        <div style={{
          position:'absolute', top:'50%', left:'50%',
          transform:'translate(-50%,-50%)',
          zIndex:30,
          animation:'iidps-shield-glow 2.6s ease-in-out infinite',
        }}>
          <svg width={116*s} height={132*s} viewBox="0 0 116 132" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="iidps-gBody" x1="25%" y1="0%" x2="75%" y2="100%">
                <stop offset="0%"   stopColor="#0e2d52"/>
                <stop offset="55%"  stopColor="#071828"/>
                <stop offset="100%" stopColor="#020810"/>
              </linearGradient>
              <linearGradient id="iidps-gEdge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#00f0ff"/>
                <stop offset="35%"  stopColor="#00aaff"/>
                <stop offset="65%"  stopColor="#0066ff"/>
                <stop offset="100%" stopColor="#00f0ff"/>
              </linearGradient>
              <linearGradient id="iidps-gFace" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="rgba(0,240,255,0.14)"/>
                <stop offset="100%" stopColor="rgba(0,60,180,0.03)"/>
              </linearGradient>
              <linearGradient id="iidps-gBevel" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="rgba(0,220,255,0.22)"/>
                <stop offset="100%" stopColor="rgba(0,100,200,0.04)"/>
              </linearGradient>
              <radialGradient id="iidps-gOrb" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#00f0ff" stopOpacity="1"/>
                <stop offset="60%"  stopColor="#0088ff" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#0033cc" stopOpacity="0.1"/>
              </radialGradient>
            </defs>
            <path d="M58,4 C58,4 14,14 6,19 L6,60 C6,94 58,125 58,125 C58,125 110,94 110,60 L110,19 C102,14 58,4 58,4 Z" fill="url(#iidps-gBody)" stroke="url(#iidps-gEdge)" strokeWidth="2.8" strokeLinejoin="round"/>
            <path d="M58,13 C58,13 18,22 12,26 L12,60 C12,87 58,115 58,115 C58,115 104,87 104,60 L104,26 C98,22 58,13 58,13 Z" fill="url(#iidps-gFace)" stroke="rgba(0,240,255,0.2)" strokeWidth="0.8"/>
            <path d="M58,4 C58,4 14,14 6,19 L6,38 C18,32 58,23 58,23 C58,23 98,32 110,38 L110,19 C102,14 58,4 58,4 Z" fill="url(#iidps-gBevel)"/>
            <path d="M6,19 L12,26 L12,90 L6,84 Z"    fill="rgba(0,180,255,0.06)"/>
            <path d="M110,19 L104,26 L104,90 L110,84 Z" fill="rgba(0,180,255,0.06)"/>
            <line x1="58"  y1="15" x2="58"  y2="113" stroke="rgba(0,240,255,0.15)" strokeWidth="0.8"/>
            <line x1="18"  y1="46" x2="98"  y2="46"  stroke="rgba(0,240,255,0.2)"  strokeWidth="0.8"/>
            <line x1="14"  y1="63" x2="102" y2="63"  stroke="rgba(0,240,255,0.13)" strokeWidth="0.6"/>
            <line x1="18"  y1="80" x2="98"  y2="80"  stroke="rgba(0,240,255,0.09)" strokeWidth="0.5"/>
            <line x1="18"  y1="46" x2="58"  y2="15"  stroke="rgba(0,240,255,0.09)" strokeWidth="0.5"/>
            <line x1="98"  y1="46" x2="58"  y2="15"  stroke="rgba(0,240,255,0.09)" strokeWidth="0.5"/>
            <line x1="12"  y1="60" x2="58"  y2="80"  stroke="rgba(0,240,255,0.06)" strokeWidth="0.5"/>
            <line x1="104" y1="60" x2="58"  y2="80"  stroke="rgba(0,240,255,0.06)" strokeWidth="0.5"/>
            <circle cx="58" cy="70" r="26" fill="rgba(0,240,255,0.03)" stroke="rgba(0,240,255,0.22)" strokeWidth="1"   strokeDasharray="5 4"/>
            <circle cx="58" cy="70" r="20" fill="rgba(0,240,255,0.05)" stroke="rgba(0,240,255,0.38)" strokeWidth="1.2"/>
            <circle cx="58" cy="70" r="14" fill="rgba(0,240,255,0.09)" stroke="rgba(0,240,255,0.58)" strokeWidth="1.3"/>
            <circle cx="58" cy="70" r="8"  fill="rgba(0,240,255,0.22)" stroke="rgba(0,240,255,0.88)" strokeWidth="1.2"/>
            <circle cx="58" cy="70" r="4"  fill="url(#iidps-gOrb)"/>
            <circle cx="58" cy="70" r="2"  fill="white" opacity="0.85"/>
            <circle cx="36" cy="46" r="3.8" fill="#00f0ff" opacity="0.88"/>
            <circle cx="80" cy="46" r="3.8" fill="#00f0ff" opacity="0.88"/>
            <circle cx="24" cy="70" r="3"   fill="#00aaff" opacity="0.75"/>
            <circle cx="92" cy="70" r="3"   fill="#00aaff" opacity="0.75"/>
            <circle cx="58" cy="28" r="3.4" fill="#00f0ff" opacity="0.82"/>
            <circle cx="38" cy="88" r="2.6" fill="#00ccff" opacity="0.65"/>
            <circle cx="78" cy="88" r="2.6" fill="#00ccff" opacity="0.65"/>
            <line x1="36" y1="46" x2="58" y2="70"  stroke="rgba(0,240,255,0.3)"  strokeWidth="0.9"/>
            <line x1="80" y1="46" x2="58" y2="70"  stroke="rgba(0,240,255,0.3)"  strokeWidth="0.9"/>
            <line x1="24" y1="70" x2="58" y2="70"  stroke="rgba(0,240,255,0.22)" strokeWidth="0.8"/>
            <line x1="92" y1="70" x2="58" y2="70"  stroke="rgba(0,240,255,0.22)" strokeWidth="0.8"/>
            <line x1="58" y1="28" x2="58" y2="46"  stroke="rgba(0,240,255,0.26)" strokeWidth="0.8"/>
            <line x1="36" y1="46" x2="58" y2="28"  stroke="rgba(0,240,255,0.14)" strokeWidth="0.6"/>
            <line x1="80" y1="46" x2="58" y2="28"  stroke="rgba(0,240,255,0.14)" strokeWidth="0.6"/>
            <line x1="38" y1="88" x2="58" y2="70"  stroke="rgba(0,240,255,0.17)" strokeWidth="0.7"/>
            <line x1="78" y1="88" x2="58" y2="70"  stroke="rgba(0,240,255,0.17)" strokeWidth="0.7"/>
            <path d="M38,94 L58,106 L78,94" fill="none" stroke="rgba(0,240,255,0.38)" strokeWidth="1.3" strokeLinejoin="round"/>
            <line x1="38"  y1="88"  x2="38"  y2="94"  stroke="rgba(0,240,255,0.22)" strokeWidth="0.8"/>
            <line x1="78"  y1="88"  x2="78"  y2="94"  stroke="rgba(0,240,255,0.22)" strokeWidth="0.8"/>
            <line x1="58"  y1="106" x2="58"  y2="113" stroke="rgba(0,240,255,0.18)" strokeWidth="0.8"/>
            <circle cx="11"  cy="28" r="2.2" fill="rgba(0,240,255,0.45)" stroke="rgba(0,240,255,0.7)" strokeWidth="0.8"/>
            <circle cx="105" cy="28" r="2.2" fill="rgba(0,240,255,0.45)" stroke="rgba(0,240,255,0.7)" strokeWidth="0.8"/>
            <circle cx="8"   cy="60" r="1.8" fill="rgba(0,200,255,0.35)" stroke="rgba(0,200,255,0.6)" strokeWidth="0.7"/>
            <circle cx="108" cy="60" r="1.8" fill="rgba(0,200,255,0.35)" stroke="rgba(0,200,255,0.6)" strokeWidth="0.7"/>
            <path d="M40,13 L34,8 L40,5" fill="none" stroke="rgba(0,240,255,0.25)" strokeWidth="0.8"/>
            <path d="M76,13 L82,8 L76,5" fill="none" stroke="rgba(0,240,255,0.25)" strokeWidth="0.8"/>
          </svg>
        </div>

      </div>
    </div>
  );
};

export default ShieldAnimation;