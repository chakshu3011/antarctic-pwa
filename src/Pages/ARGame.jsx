import React, { useState, useRef, useEffect } from 'react';

// ── Config ────────────────────────────────────────────────────────────────────
const ROWS       = 5;
const COLS       = 3;
const MAX_LIVES  = 5;
const MOVE_SEC   = 10;   // seconds per tap
const GAME_SEC   = 180;  // 3 min overall

// ── Quiz pool ─────────────────────────────────────────────────────────────────
const QUIZ_POOL = [
  { q: 'Where do most penguins live?',                                  correct: 'Antarctica',                       wrong: ['The Arctic', 'Tropical Africa'] },
  { q: 'What do penguins mainly eat?',                                   correct: 'Fish and krill',                   wrong: ['Seeds and berries', 'Leaves and bark'] },
  { q: 'Can penguins fly?',                                              correct: 'No — they use wings to swim',      wrong: ['Yes, at low altitude', 'Only newborns can'] },
  { q: 'What is the largest penguin species?',                           correct: 'Emperor Penguin',                  wrong: ['Little Blue Penguin', 'Gentoo Penguin'] },
  { q: 'How long can an Emperor Penguin hold its breath?',               correct: 'Up to 22 minutes',                 wrong: ['About 2 minutes', 'About 5 minutes'] },
  { q: 'What is a group of penguins on land called?',                    correct: 'A rookery (colony)',                wrong: ['A flock', 'A pod'] },
  { q: 'Roughly what fraction of Earth\'s fresh water is in Antarctica?', correct: 'About 70%',                       wrong: ['About 30%', 'About 15%'] },
  { q: 'What keeps penguins warm in freezing conditions?',               correct: 'Blubber and tightly packed feathers', wrong: ['Thick outer fur', 'Body heat tunnels'] },
  { q: 'What is the coldest temperature ever recorded on Earth?',        correct: '−89.2 °C in Antarctica',           wrong: ['−60 °C in Siberia', '−40 °C in Canada'] },
  { q: 'How long does an Emperor Penguin incubate its egg?',             correct: 'About 65 days',                    wrong: ['About 20 days', 'About 100 days'] },
  { q: 'How fast can an Emperor Penguin swim?',                          correct: 'Up to ~15 km/h',                   wrong: ['Up to ~5 km/h', 'Up to ~50 km/h'] },
  { q: 'Antarctica is technically the world\'s largest…',               correct: 'Desert (extremely low rainfall)',   wrong: ['Ocean', 'Forest'] },
];

const buildPath = () =>
  Array.from({ length: ROWS }, () => Math.floor(Math.random() * COLS));

const buildQuizSet = () =>
  [...QUIZ_POOL]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .map(item => {
      const opts = [item.correct, ...item.wrong].sort(() => Math.random() - 0.5);
      return { q: item.q, opts, ans: opts.indexOf(item.correct) };
    });

const SNOWFLAKES = Array.from({ length: 18 }, () => ({
  left: Math.random() * 96, size: 2 + Math.random() * 4,
  duration: 6 + Math.random() * 8, delay: -(Math.random() * 14),
  opacity: 0.15 + Math.random() * 0.35,
}));

// ── Component ─────────────────────────────────────────────────────────────────
const ARGame = () => {
  // gameState: intro | puzzle | puzzleFeedback | levelComplete | quiz | quizFeedback | win | fail
  const [gameState,    setGameState]    = useState('intro');
  const [currentRow,   setCurrentRow]   = useState(ROWS - 1);
  const [lives,        setLives]        = useState(MAX_LIVES);
  const [score,        setScore]        = useState(0);
  const [combo,        setCombo]        = useState(0);
  const [moveTime,     setMoveTime]     = useState(MOVE_SEC);
  const [gameTime,     setGameTime]     = useState(GAME_SEC);
  const [feedback,     setFeedback]     = useState(null);
  const [crackedCells, setCrackedCells] = useState(new Set());
  const [safeCells,    setSafeCells]    = useState(new Set());
  const [puzzlePath,   setPuzzlePath]   = useState(buildPath);
  const [quizSet,      setQuizSet]      = useState(buildQuizSet);
  const [quizIndex,    setQuizIndex]    = useState(0);
  const [penguinAnim,  setPenguinAnim]  = useState('idle'); // idle | walk | shake

  const livesRef     = useRef(MAX_LIVES);
  const processingRef = useRef(false);

  const inPuzzle = gameState === 'puzzle' || gameState === 'puzzleFeedback';
  const inQuiz   = gameState === 'quiz'   || gameState === 'quizFeedback';
  const moveActive = gameState === 'puzzle' || gameState === 'quiz';
  const gameActive = inPuzzle || inQuiz;

  // ── Overall game timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (!gameActive || gameTime <= 0) return;
    const id = setTimeout(() => setGameTime(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [gameActive, gameTime]);

  useEffect(() => {
    if (gameTime === 0 && gameActive) setGameState('fail');
  }, [gameTime, gameActive]);

  // ── Move timer (sea lion) ─────────────────────────────────────────────────
  useEffect(() => {
    if (!moveActive || moveTime <= 0) return;
    const id = setTimeout(() => setMoveTime(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [moveActive, moveTime]);

  useEffect(() => {
    if (moveTime !== 0 || !moveActive || processingRef.current) return;
    processingRef.current = true;
    setCombo(0);
    const remaining = livesRef.current - 1;
    livesRef.current = remaining;
    setLives(remaining);
    setPenguinAnim('shake');
    setFeedback({ correct: false, text: "⏰ Too slow! Sea lion strikes! −1 life" });
    const nextState = gameState === 'puzzle' ? 'puzzleFeedback' : 'quizFeedback';
    const resumeState = gameState === 'puzzle' ? 'puzzle' : 'quiz';
    setGameState(nextState);
    setTimeout(() => {
      setPenguinAnim('idle');
      processingRef.current = false;
      if (remaining <= 0) { setGameState('fail'); return; }
      setMoveTime(MOVE_SEC);
      setFeedback(null);
      setGameState(resumeState);
    }, 1500);
  }, [moveTime, moveActive, gameState]);

  // ── Start game ────────────────────────────────────────────────────────────
  const startGame = () => {
    livesRef.current  = MAX_LIVES;
    processingRef.current = false;
    setCurrentRow(ROWS - 1);
    setLives(MAX_LIVES);
    setScore(0);
    setCombo(0);
    setMoveTime(MOVE_SEC);
    setGameTime(GAME_SEC);
    setFeedback(null);
    setCrackedCells(new Set());
    setSafeCells(new Set());
    setPuzzlePath(buildPath());
    setQuizSet(buildQuizSet());
    setQuizIndex(0);
    setPenguinAnim('idle');
    setGameState('puzzle');
  };

  // ── Advance to quiz ───────────────────────────────────────────────────────
  const startQuiz = () => {
    processingRef.current = false;
    setMoveTime(MOVE_SEC);
    setFeedback(null);
    setPenguinAnim('idle');
    setGameState('quiz');
  };

  // ── Puzzle cell tap ───────────────────────────────────────────────────────
  const handleCellTap = (row, col) => {
    if (gameState !== 'puzzle' || row !== currentRow || processingRef.current) return;
    processingRef.current = true;

    const correct = col === puzzlePath[row];
    if (correct) {
      const newCombo = combo + 1;
      const mult     = newCombo >= 3 ? 2 : newCombo >= 2 ? 1.5 : 1;
      const earned   = Math.round(10 * mult);
      setCombo(newCombo);
      setScore(s => s + earned);
      setSafeCells(prev => new Set([...prev, `${row}-${col}`]));
      setPenguinAnim('walk');
      setFeedback({ correct: true, earned, combo: newCombo, row, col });
      setGameState('puzzleFeedback');
      setTimeout(() => {
        setPenguinAnim('idle');
        processingRef.current = false;
        if (row - 1 < 0) {
          setGameState('levelComplete');
        } else {
          setCurrentRow(row - 1);
          setMoveTime(MOVE_SEC);
          setFeedback(null);
          setGameState('puzzle');
        }
      }, 1000);
    } else {
      setCombo(0);
      setCrackedCells(prev => new Set([...prev, `${row}-${col}`]));
      const remaining = livesRef.current - 1;
      livesRef.current = remaining;
      setLives(remaining);
      setPenguinAnim('shake');
      setFeedback({ correct: false, text: '💥 Cracked ice! −1 life', row, col });
      setGameState('puzzleFeedback');
      setTimeout(() => {
        setPenguinAnim('idle');
        processingRef.current = false;
        if (remaining <= 0) { setGameState('fail'); return; }
        setMoveTime(MOVE_SEC);
        setFeedback(null);
        setGameState('puzzle');
      }, 1000);
    }
  };

  // ── Quiz answer ───────────────────────────────────────────────────────────
  const handleQuizAnswer = (optIdx) => {
    if (gameState !== 'quiz' || processingRef.current) return;
    processingRef.current = true;

    const q       = quizSet[quizIndex];
    const correct = optIdx === q.ans;
    if (correct) {
      const newCombo = combo + 1;
      const earned   = Math.round(20 * (newCombo >= 2 ? 1.5 : 1));
      setCombo(newCombo);
      setScore(s => s + earned);
      setPenguinAnim('walk');
      setFeedback({ correct: true, earned, text: `✅ Correct! +${earned} pts`, answer: q.opts[q.ans] });
    } else {
      setCombo(0);
      const remaining = livesRef.current - 1;
      livesRef.current = remaining;
      setLives(remaining);
      setPenguinAnim('shake');
      setFeedback({ correct: false, text: '❌ Wrong! −1 life', answer: `Correct: ${q.opts[q.ans]}` });
    }
    setGameState('quizFeedback');
    setTimeout(() => {
      setPenguinAnim('idle');
      processingRef.current = false;
      if (!correct && livesRef.current <= 0) { setGameState('fail'); return; }
      const next = quizIndex + 1;
      if (next >= quizSet.length) { setGameState('win'); return; }
      setQuizIndex(next);
      setMoveTime(MOVE_SEC);
      setFeedback(null);
      setGameState('quiz');
    }, 2200);
  };

  const activateAR = () => document.getElementById('ar-mv')?.activateAR?.();

  // ── Derived display values ────────────────────────────────────────────────
  const livesIcons = Array.from({ length: MAX_LIVES }, (_, i) => i < lives ? '❤️' : '🖤').join('');
  const gMin       = Math.floor(gameTime / 60).toString().padStart(2, '0');
  const gSec       = (gameTime % 60).toString().padStart(2, '0');
  const movePct    = moveTime / MOVE_SEC;
  const moveColor  = movePct > 0.5 ? '#4ade80' : movePct > 0.25 ? '#fbbf24' : '#f87171';
  const stepsLeft  = currentRow + 1;

  // ── Cube style helper ─────────────────────────────────────────────────────
  const cubeStyle = (rowIndex, colIndex) => {
    const key        = `${rowIndex}-${colIndex}`;
    const isCurrent  = rowIndex === currentRow;
    const isPast     = rowIndex > currentRow;
    const isCracked  = crackedCells.has(key);
    const isSafe     = safeCells.has(key);
    const isFeedback = (gameState === 'puzzleFeedback') && feedback?.row === rowIndex && feedback?.col === colIndex;

    let bg     = 'linear-gradient(135deg,rgba(186,230,253,0.18) 0%,rgba(147,197,253,0.10) 100%)';
    let border = 'rgba(147,197,253,0.15)';
    let shadow = '0 3px 0 rgba(0,20,60,0.4),0 4px 8px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.1)';
    let cursor = 'default';
    let anim   = 'none';

    if (isSafe) {
      bg     = 'linear-gradient(135deg,rgba(52,211,153,0.4),rgba(16,185,129,0.25))';
      border = '#34d399';
      shadow = '0 3px 0 rgba(6,78,59,0.5),0 4px 10px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.2)';
    } else if (isCracked) {
      bg     = 'linear-gradient(135deg,rgba(239,68,68,0.35),rgba(220,38,38,0.2))';
      border = '#ef4444';
      shadow = '0 2px 0 rgba(127,29,29,0.5),0 4px 10px rgba(0,0,0,0.3)';
    } else if (isCurrent) {
      bg     = 'linear-gradient(135deg,rgba(200,240,255,0.65) 0%,rgba(147,210,253,0.45) 40%,rgba(96,165,250,0.3) 100%)';
      border = 'rgba(147,197,253,0.9)';
      shadow = '0 6px 0 rgba(0,30,100,0.6),0 8px 16px rgba(0,0,0,0.45),inset 0 0 0 1px rgba(255,255,255,0.15),inset 0 1px 0 rgba(255,255,255,0.4)';
      cursor = 'pointer';
      anim   = isFeedback && !feedback?.correct ? 'shake 0.6s ease' : 'cubePulse 2s ease-in-out infinite';
    }

    return {
      flex: 1, minHeight: 0, position: 'relative',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      borderRadius: '12px', border: `2px solid ${border}`,
      background: bg, boxShadow: shadow, cursor, padding: 0,
      opacity: isPast ? 0.25 : 1,
      transition: 'all 0.25s ease',
      animation: anim,
      WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
    };
  };

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{
      position: 'fixed', inset: 0, width: '100vw', height: '100dvh',
      overflow: 'hidden', fontFamily: "'Segoe UI', system-ui, sans-serif",
      background: 'linear-gradient(160deg,#000820 0%,#001240 50%,#002060 100%)',
      color: 'white',
    }}>

      {/* Snowflakes */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {SNOWFLAKES.map((f, i) => (
          <div key={i} style={{
            position: 'absolute', top: 0, left: `${f.left}%`,
            width: `${f.size}px`, height: `${f.size}px`, borderRadius: '50%',
            background: `rgba(200,230,255,${f.opacity})`,
            animation: `snowfall ${f.duration}s linear ${f.delay}s infinite`,
          }} />
        ))}
      </div>

      {/* ══ INTRO ══════════════════════════════════════════════════════════════ */}
      {gameState === 'intro' && (
        <div style={{
          position: 'relative', zIndex: 10, height: '100dvh', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '20px 20px 32px', boxSizing: 'border-box',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '6px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '3px', color: '#60a5fa', fontWeight: 'bold' }}>M-HIT · ANTARCTIC AR</div>
            <h1 style={{ margin: '2px 0 0', fontSize: 'clamp(28px,7vw,36px)', fontWeight: '900', color: '#bfdbfe', textShadow: '0 0 30px rgba(96,165,250,0.7)', lineHeight: 1.1 }}>
              ICE SWEET ICE
            </h1>
            <div style={{ fontSize: '12px', color: '#7dd3fc', marginTop: '2px' }}>🐧 Antarctic Rescue Mission</div>
          </div>

          <div style={{ width: '100%', maxWidth: '280px', height: '190px', borderRadius: '20px', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(147,197,253,0.4)', margin: '12px 0' }}>
            <model-viewer
              id="ar-mv"
              src="/models/walking_emperor_penguin_chick.glb"
              ios-src="/models/Walking_Emperor_Penguin_Chick.usdz"
              ar ar-modes="webxr scene-viewer quick-look" ar-placement="floor" ar-scale="fixed"
              camera-controls autoplay animation-name="walk" scale="5 5 5"
              style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
            ></model-viewer>
          </div>

          {/* 2-stage brief */}
          <div style={{ width: '100%', maxWidth: '300px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(147,197,253,0.25)', borderRadius: '16px', padding: '14px 16px', marginBottom: '12px', boxSizing: 'border-box' }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 'bold', color: '#93c5fd' }}>🐧 Mission Brief</p>
            <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6 }}>
              Baby penguin <strong>ICY</strong> must complete <strong>2 stages</strong> to reunite with its parents!
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <div style={{ flex: 1, background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.4)', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px' }}>🧊</div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#7dd3fc' }}>STAGE 1</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.3 }}>Ice Cube Puzzle<br />Cross 5 rows safely</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.4)', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px' }}>🧠</div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#c4b5fd' }}>STAGE 2</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.3 }}>Antarctic Quiz<br />Answer 5 questions</div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#60a5fa', lineHeight: 1.6 }}>
              ⏱️ 3 min total · ❤️×5 lives · 🦭 10s per move<br />
              🔀 Randomised every game — no memorising!
            </p>
          </div>

          <button onClick={activateAR} style={{ padding: '9px 22px', background: 'rgba(29,78,216,0.7)', color: 'white', border: '1px solid #93c5fd', borderRadius: '18px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>
            📱 Preview ICY in AR
          </button>
          <button onClick={startGame} style={{ padding: '15px 48px', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: 'white', border: '2px solid #93c5fd', borderRadius: '36px', fontSize: '17px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 28px rgba(37,99,235,0.6)', letterSpacing: '1px', WebkitTapHighlightColor: 'transparent' }}>
            🚀 BEGIN RESCUE
          </button>
        </div>
      )}

      {/* ══ LEVEL COMPLETE (Stage 1 → Stage 2) ════════════════════════════════ */}
      {gameState === 'levelComplete' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,15,50,0.97)', backdropFilter: 'blur(10px)', padding: '24px', boxSizing: 'border-box', textAlign: 'center' }}>
          <div style={{ fontSize: '52px', marginBottom: '6px' }}>🧊✅</div>
          <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '900', color: '#4ade80', textShadow: '0 0 20px rgba(74,222,128,0.5)' }}>STAGE 1 COMPLETE!</h2>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#86efac', lineHeight: 1.6, maxWidth: '250px' }}>
            ICY crossed the ice field! But the family reunion isn't over — the parents need proof you know the Antarctic!
          </p>
          <div style={{ background: 'rgba(167,139,250,0.15)', border: '1.5px solid rgba(167,139,250,0.5)', borderRadius: '14px', padding: '12px 20px', marginBottom: '16px', width: '100%', maxWidth: '280px', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>🧠</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#c4b5fd' }}>STAGE 2 — Antarctic Quiz</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Answer 5 randomised questions correctly to reunite ICY with its family!</div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: '900', color: '#fde68a', marginBottom: '4px' }}>{score}</div>
          <p style={{ margin: '0 0 18px', fontSize: '11px', color: '#94a3b8' }}>Score so far · {livesIcons}</p>
          <button onClick={startQuiz} style={{ padding: '14px 44px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: 'white', border: '2px solid #c4b5fd', borderRadius: '32px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
            🧠 Start Quiz →
          </button>
        </div>
      )}

      {/* ══ PUZZLE SCREEN ══════════════════════════════════════════════════════ */}
      {inPuzzle && (
        <div style={{ position: 'relative', zIndex: 10, height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 10px 6px', boxSizing: 'border-box', gap: '5px' }}>

          {/* HUD */}
          <div style={{ width: '100%', maxWidth: '400px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ background: 'rgba(0,0,0,0.7)', borderRadius: '12px', padding: '5px 10px', fontSize: '12px', fontWeight: 'bold', color: '#fde68a' }}>
              ⏰ {gMin}:{gSec}
            </div>
            <div style={{ background: 'rgba(96,165,250,0.2)', border: '1px solid rgba(96,165,250,0.4)', borderRadius: '12px', padding: '5px 12px', fontSize: '11px', fontWeight: 'bold', color: '#7dd3fc', textAlign: 'center' }}>
              🧊 STAGE 1 · ICE PUZZLE
            </div>
            <div style={{ background: 'rgba(0,0,0,0.7)', borderRadius: '12px', padding: '5px 10px', fontSize: '12px' }}>
              {livesIcons}
            </div>
          </div>

          {/* 3D Baby Penguin viewer + score */}
          <div style={{ width: '100%', maxWidth: '400px', flexShrink: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '90px', height: '72px', borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(147,197,253,0.4)', flexShrink: 0 }}>
              <model-viewer
                id="ar-mv"
                src="/models/walking_emperor_penguin_chick.glb"
                ios-src="/models/Walking_Emperor_Penguin_Chick.usdz"
                ar ar-modes="webxr scene-viewer quick-look" ar-placement="floor" ar-scale="fixed"
                camera-controls autoplay animation-name="walk" scale="5 5 5"
                style={{
                  width: '100%', height: '100%', backgroundColor: 'transparent',
                  animation: penguinAnim === 'walk' ? 'penguinGlow 1s ease' : penguinAnim === 'shake' ? 'shake 0.6s ease' : 'none',
                }}
              ></model-viewer>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#93c5fd', marginBottom: '2px' }}>ICY the Baby Penguin</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#fde68a', lineHeight: 1 }}>🏆 {score}</div>
              {combo >= 2 && <div style={{ fontSize: '10px', color: '#fbbf24', marginTop: '2px' }}>🔥 ×{combo >= 3 ? '2.0' : '1.5'} COMBO!</div>}
              <div style={{ fontSize: '10px', color: '#60a5fa', marginTop: '2px' }}>{stepsLeft} step{stepsLeft !== 1 ? 's' : ''} left</div>
            </div>
            <button onClick={activateAR} style={{ padding: '6px 10px', background: 'rgba(29,78,216,0.6)', color: 'white', border: '1px solid rgba(147,197,253,0.4)', borderRadius: '10px', fontSize: '9px', fontWeight: 'bold', cursor: 'pointer', flexShrink: 0 }}>📱 AR</button>
          </div>

          {/* Board */}
          <div style={{ flex: 1, width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden', minHeight: 0 }}>

            {/* GOAL */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexShrink: 0, height: '40px', background: 'linear-gradient(90deg,rgba(74,222,128,0.05),rgba(74,222,128,0.2),rgba(74,222,128,0.05))', borderRadius: '12px', border: '1.5px solid rgba(74,222,128,0.6)' }}>
              <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#4ade80', letterSpacing: '1px' }}>🏁 GOAL</span>
              <span style={{ fontSize: '28px' }}>🐧🐧</span>
              <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#4ade80', letterSpacing: '1px' }}>PARENTS WAIT</span>
            </div>

            {/* Grid */}
            {Array.from({ length: ROWS }, (_, rowIndex) => (
              <div key={rowIndex} style={{ display: 'flex', gap: '5px', flex: 1, minHeight: 0 }}>
                <div style={{ width: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', color: rowIndex === currentRow ? '#7dd3fc' : '#1e3a5f' }}>
                  {ROWS - rowIndex}
                </div>
                {Array.from({ length: COLS }, (_, colIndex) => {
                  const isCurrent  = rowIndex === currentRow;
                  const key        = `${rowIndex}-${colIndex}`;
                  const isSafe     = safeCells.has(key);
                  const isCracked  = crackedCells.has(key);
                  const isFBCell   = gameState === 'puzzleFeedback' && feedback?.row === rowIndex && feedback?.col === colIndex;
                  return (
                    <button key={key} onClick={() => handleCellTap(rowIndex, colIndex)} style={cubeStyle(rowIndex, colIndex)}>
                      <span style={{ fontSize: isCurrent ? '26px' : '16px', lineHeight: 1, transition: 'font-size 0.2s', pointerEvents: 'none' }}>
                        {isCracked ? '💥' : isSafe ? '✅' : '🧊'}
                      </span>

                      {/* Baby penguin indicator on current row center */}
                      {isCurrent && colIndex === 1 && (
                        <span style={{
                          position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)',
                          fontSize: '22px', lineHeight: 1, pointerEvents: 'none',
                          animation: penguinAnim === 'walk' ? 'penguinWalk 1s ease forwards' : 'babyFloat 2.5s ease-in-out infinite',
                          filter: 'drop-shadow(0 0 8px rgba(96,165,250,0.95)) drop-shadow(0 0 3px #fff)',
                        }}>🐧</span>
                      )}

                      {/* Score popup */}
                      {isFBCell && feedback?.correct && (
                        <span style={{ position: 'absolute', top: '-22px', left: '50%', transform: 'translateX(-50%)', fontSize: '12px', fontWeight: 'bold', color: '#4ade80', animation: 'scoreRise 1s ease forwards', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                          +{feedback.earned}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Sea lion move timer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, height: '32px', background: 'rgba(239,68,68,0.08)', borderRadius: '10px', border: `1px solid ${moveTime < 4 ? 'rgba(239,68,68,0.9)' : 'rgba(239,68,68,0.25)'}`, padding: '0 10px', animation: moveTime < 4 ? 'dangerPulse 0.5s ease infinite' : 'none', transition: 'border-color 0.3s' }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>🦭</span>
              <div style={{ flex: 1, height: '5px', background: 'rgba(239,68,68,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${movePct * 100}%`, background: moveColor, borderRadius: '3px', transition: 'width 1s linear, background 0.3s' }} />
              </div>
              <span style={{ fontSize: '10px', color: moveColor, fontWeight: 'bold', flexShrink: 0 }}>{moveTime}s</span>
            </div>
          </div>

          {/* Feedback */}
          {gameState === 'puzzleFeedback' && feedback && (
            <div style={{ width: '100%', maxWidth: '400px', flexShrink: 0, padding: '7px 14px', borderRadius: '12px', textAlign: 'center', background: feedback.correct ? 'rgba(52,211,153,0.18)' : 'rgba(239,68,68,0.18)', border: `1.5px solid ${feedback.correct ? '#34d399' : '#ef4444'}`, animation: 'slideUp 0.3s ease', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '13px', fontWeight: '900', color: feedback.correct ? '#6ee7b7' : '#fca5a5' }}>
                {feedback.correct
                  ? `✅ Safe ice! +${feedback.earned} pts${feedback.combo >= 2 ? ` 🔥 ×${feedback.combo >= 3 ? '2' : '1.5'} COMBO!` : ''}`
                  : (feedback.text || '💥 Wrong!')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ QUIZ SCREEN ════════════════════════════════════════════════════════ */}
      {inQuiz && quizSet.length > 0 && (
        <div style={{ position: 'relative', zIndex: 10, height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 12px 10px', boxSizing: 'border-box', gap: '8px' }}>

          {/* HUD */}
          <div style={{ width: '100%', maxWidth: '400px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ background: 'rgba(0,0,0,0.7)', borderRadius: '12px', padding: '5px 10px', fontSize: '12px', fontWeight: 'bold', color: '#fde68a' }}>⏰ {gMin}:{gSec}</div>
            <div style={{ background: 'rgba(167,139,250,0.2)', border: '1px solid rgba(167,139,250,0.4)', borderRadius: '12px', padding: '5px 12px', fontSize: '11px', fontWeight: 'bold', color: '#c4b5fd' }}>
              🧠 STAGE 2 · QUIZ
            </div>
            <div style={{ background: 'rgba(0,0,0,0.7)', borderRadius: '12px', padding: '5px 10px', fontSize: '12px' }}>{livesIcons}</div>
          </div>

          {/* Penguin panel + score */}
          <div style={{ width: '100%', maxWidth: '400px', flexShrink: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '90px', height: '72px', borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(167,139,250,0.4)', flexShrink: 0 }}>
              <model-viewer
                src="/models/walking_emperor_penguin_chick.glb"
                ios-src="/models/Walking_Emperor_Penguin_Chick.usdz"
                camera-controls autoplay animation-name="walk" scale="5 5 5"
                style={{ width: '100%', height: '100%', backgroundColor: 'transparent', animation: penguinAnim === 'walk' ? 'penguinGlow 1s ease' : penguinAnim === 'shake' ? 'shake 0.6s ease' : 'none' }}
              ></model-viewer>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#c4b5fd' }}>ICY awaits the answer…</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#fde68a', lineHeight: 1 }}>🏆 {score}</div>
              {combo >= 2 && <div style={{ fontSize: '10px', color: '#fbbf24', marginTop: '2px' }}>🔥 COMBO!</div>}
            </div>
            {/* Progress dots */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
              <div style={{ fontSize: '9px', color: '#94a3b8' }}>Q{quizIndex + 1}/5</div>
              <div style={{ display: 'flex', gap: '3px' }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i < quizIndex ? '#4ade80' : i === quizIndex ? '#c4b5fd' : 'rgba(255,255,255,0.15)' }} />
                ))}
              </div>
            </div>
          </div>

          {/* Question card */}
          <div style={{ width: '100%', maxWidth: '400px', flexShrink: 0, background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(167,139,250,0.35)', borderRadius: '16px', padding: '14px 16px', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '10px', color: '#a78bfa', fontWeight: 'bold', marginBottom: '6px', letterSpacing: '1px' }}>🧊 PENGUIN KNOWLEDGE CHECK</div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#e2e8f0', lineHeight: 1.5 }}>
              {quizSet[quizIndex]?.q}
            </p>
          </div>

          {/* Answer options */}
          <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
            {quizSet[quizIndex]?.opts.map((opt, i) => {
              const isFBOpt = gameState === 'quizFeedback' && feedback;
              const isCorrectOpt = isFBOpt && i === quizSet[quizIndex].ans;
              const isWrongPick  = isFBOpt && !feedback.correct && i !== quizSet[quizIndex].ans && opt === (feedback.picked ?? opt);
              let bg = 'rgba(255,255,255,0.07)', border = 'rgba(147,197,253,0.3)', color = '#e2e8f0';
              if (isCorrectOpt)  { bg = 'rgba(52,211,153,0.2)';  border = '#34d399'; color = '#6ee7b7'; }
              return (
                <button key={i} onClick={() => handleQuizAnswer(i)} style={{
                  width: '100%', padding: '13px 16px',
                  background: bg, border: `1.5px solid ${border}`,
                  borderRadius: '12px', color, fontSize: '13px', fontWeight: 'bold',
                  textAlign: 'left', cursor: gameState === 'quiz' ? 'pointer' : 'default',
                  boxSizing: 'border-box', transition: 'all 0.2s',
                  WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
                }}>
                  <span style={{ marginRight: '8px', color: '#60a5fa' }}>{String.fromCharCode(65 + i)}.</span> {opt}
                </button>
              );
            })}
          </div>

          {/* Sea lion move timer */}
          <div style={{ width: '100%', maxWidth: '400px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px', height: '30px', background: 'rgba(239,68,68,0.08)', borderRadius: '10px', border: `1px solid ${moveTime < 4 ? 'rgba(239,68,68,0.9)' : 'rgba(239,68,68,0.25)'}`, padding: '0 10px', animation: moveTime < 4 ? 'dangerPulse 0.5s ease infinite' : 'none', transition: 'border-color 0.3s', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '14px' }}>🦭</span>
            <div style={{ flex: 1, height: '5px', background: 'rgba(239,68,68,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${movePct * 100}%`, background: moveColor, borderRadius: '3px', transition: 'width 1s linear, background 0.3s' }} />
            </div>
            <span style={{ fontSize: '10px', color: moveColor, fontWeight: 'bold' }}>{moveTime}s</span>
          </div>

          {/* Quiz feedback */}
          {gameState === 'quizFeedback' && feedback && (
            <div style={{ width: '100%', maxWidth: '400px', flexShrink: 0, padding: '8px 14px', borderRadius: '12px', textAlign: 'center', background: feedback.correct ? 'rgba(52,211,153,0.18)' : 'rgba(239,68,68,0.18)', border: `1.5px solid ${feedback.correct ? '#34d399' : '#ef4444'}`, animation: 'slideUp 0.3s ease', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '13px', fontWeight: '900', color: feedback.correct ? '#6ee7b7' : '#fca5a5' }}>
                {feedback.text}
              </div>
              {feedback.answer && !feedback.correct && (
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>{feedback.answer}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══ WIN ════════════════════════════════════════════════════════════════ */}
      {gameState === 'win' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,20,50,0.97)', backdropFilter: 'blur(10px)', padding: '24px', boxSizing: 'border-box', textAlign: 'center' }}>
          <div style={{ fontSize: '52px', marginBottom: '6px' }}>🎊</div>
          <h2 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: '900', color: '#4ade80', textShadow: '0 0 20px rgba(74,222,128,0.6)' }}>FAMILY REUNITED!</h2>
          <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#86efac', maxWidth: '260px', lineHeight: 1.6 }}>
            ICY crossed the ice field AND passed the Antarctic quiz! The sea lion retreats in defeat. 🦭🚫
          </p>
          <div style={{ fontSize: '26px', margin: '6px 0' }}>🐧👨‍👩‍👧‍👦 ❄️🏔️</div>
          <div style={{ fontSize: '54px', fontWeight: '900', color: '#fde68a', lineHeight: 1, marginBottom: '4px' }}>{score}</div>
          <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#94a3b8' }}>FINAL SCORE</p>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: score >= 200 ? '#4ade80' : score >= 100 ? '#fbbf24' : '#94a3b8' }}>
            {score >= 200 ? '⭐⭐⭐ Antarctic Legend!' : score >= 100 ? '⭐⭐ Excellent Rescuer!' : '⭐ Well done, hero!'}
          </p>
          <div style={{ width: '210px', height: '145px', borderRadius: '16px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(74,222,128,0.45)', marginBottom: '18px' }}>
            <model-viewer
              src="/models/penguin1.glb" ios-src="/models/penguin1.usdz"
              ar ar-modes="webxr scene-viewer quick-look" ar-placement="floor"
              camera-controls autoplay scale="8 8 8"
              style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
            ></model-viewer>
          </div>
          <button onClick={startGame} style={{ padding: '14px 44px', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: 'white', border: '2px solid #86efac', borderRadius: '32px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
            🔄 Play Again
          </button>
        </div>
      )}

      {/* ══ FAIL ═══════════════════════════════════════════════════════════════ */}
      {gameState === 'fail' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,0,0,0.97)', backdropFilter: 'blur(10px)', padding: '24px', boxSizing: 'border-box', textAlign: 'center' }}>
          <div style={{ fontSize: '52px', marginBottom: '8px' }}>🦭</div>
          <h2 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: '900', color: '#f87171' }}>
            {gameTime === 0 ? 'TIME\'S UP!' : 'CAUGHT!'}
          </h2>
          <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#fca5a5', lineHeight: 1.6, maxWidth: '260px' }}>
            {gameTime === 0 ? 'The 3-minute rescue window expired!' : 'The sea lion caught ICY before it could reach its parents...'}
          </p>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>
            Score: <strong style={{ color: '#fde68a' }}>{score}</strong>
          </p>
          <div style={{ fontSize: '32px', marginBottom: '22px' }}>❄️💔🐧</div>
          <button onClick={startGame} style={{ padding: '14px 44px', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', color: 'white', border: '2px solid #93c5fd', borderRadius: '32px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
            🔄 Try Again
          </button>
        </div>
      )}

      <style>{`
        @keyframes snowfall {
          0%   { transform: translateY(-12px); opacity: 0; }
          8%   { opacity: 0.7; }
          92%  { opacity: 0.7; }
          100% { transform: translateY(100dvh); opacity: 0; }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-8px); }
          40%     { transform: translateX(8px); }
          60%     { transform: translateX(-5px); }
          80%     { transform: translateX(5px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scoreRise {
          0%   { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-22px); }
        }
        @keyframes penguinWalk {
          0%   { transform: translateX(-50%) translateY(0) scale(1); filter: drop-shadow(0 0 8px rgba(96,165,250,0.95)) drop-shadow(0 0 3px #fff); }
          30%  { transform: translateX(-50%) translateY(-16px) scale(1.3); filter: drop-shadow(0 0 16px rgba(96,165,250,1)) drop-shadow(0 0 6px #fff); }
          60%  { transform: translateX(-50%) translateY(-10px) scale(1.1); }
          100% { transform: translateX(-50%) translateY(-24px) scale(0.85); opacity: 0; }
        }
        @keyframes babyFloat {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50%     { transform: translateX(-50%) translateY(-7px); }
        }
        @keyframes cubePulse {
          0%,100% { box-shadow: 0 6px 0 rgba(0,30,100,0.6), 0 8px 16px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.15), inset 0 1px 0 rgba(255,255,255,0.4); }
          50%     { box-shadow: 0 6px 0 rgba(0,30,100,0.6), 0 8px 20px rgba(0,0,0,0.5), 0 0 18px rgba(96,165,250,0.35), inset 0 0 0 1px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.5); }
        }
        @keyframes penguinGlow {
          0%,100% { filter: none; }
          50%     { filter: brightness(1.4) drop-shadow(0 0 12px rgba(96,165,250,0.8)); }
        }
        @keyframes dangerPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          50%     { box-shadow: 0 0 0 4px rgba(239,68,68,0.35); }
        }
      `}</style>
    </div>
  );
};

export default ARGame;
