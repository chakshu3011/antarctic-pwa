import React, { useState, useRef, useEffect } from 'react';

// ── Config ────────────────────────────────────────────────────────────────────
const ROWS       = 5;
const COLS       = 3;
const MAX_LIVES  = 5;
const MOVE_SEC   = 20;   // seconds per tap
const GAME_SEC   = 180;  // 3 min overall

// ── Sound paths ───────────────────────────────────────────────────────────────
const SOUND_PATHS = {
  baby: '/audio/baby-penguin.mp3',
  correct: '/audio/correct-sfx.m4a',
  incorrect: '/audio/incorrect-sfx.m4a',
  bg: '/audio/bg-freezeezy-peak.mp3',
};

// — Quiz pool ——————————————————————————————————————————————
const QUIZ_POOL = [
  { q: 'Why is it dangerous for baby penguins to fall into the ocean too early?',      correct: 'Because their feathers are not fully waterproof yet',          wrong: ['Because the water is polluted', 'Because they cannot swim underwater'] },
  { q: 'What can happen when Antarctic ice melts too early?',                          correct: 'Penguin chicks can fall into the freezing ocean too soon',     wrong: ['Penguins grow bigger in warmer weather', 'The ocean becomes safer for penguins'] },
  { q: 'What helps penguin families stay safe and survive?',                           correct: 'Thicker Antarctic ice',                                        wrong: ['Bigger ocean waves', 'Smaller ice blocks'] },
  { q: 'Why is melting sea ice dangerous for emperor penguins?',                       correct: 'They need ice to breed and rest',                              wrong: ['Penguins prefer hot weather', 'Ice stops them from swimming'] },
  { q: 'Which action helps reduce climate change?',                                    correct: 'Saving electricity',                                           wrong: ['Leaving devices on all day', 'Burning more fuel'] },
  { q: 'What is one way humans can protect penguin habitats?',                         correct: 'Reduce pollution',                                             wrong: ['Dump waste into oceans', 'Melt more ice'] },
  { q: 'Why are clean oceans important for penguins?',                                 correct: 'Penguins depend on sea life for food',                         wrong: ['Penguins only drink ocean water', 'Penguins live in forests'] },
  { q: 'What can happen if global temperatures rise?',                                 correct: 'Antarctic ice may melt faster',                                wrong: ['Penguins grow bigger', 'Oceans disappear'] },
  { q: 'Why are emperor penguins affected by climate change?',                         correct: 'They rely on stable sea ice',                                  wrong: ['They live in deserts', 'They cannot swim'] },
  { q: 'How can people help protect Antarctica?',                                      correct: 'Reduce carbon emissions',                                      wrong: ['Waste more electricity', 'Increase pollution'] },
  { q: 'How can people help protect penguin families?',                                correct: 'By helping reduce ice melting',                                wrong: ['By making the ocean deeper', 'By breaking large ice sheets apart'] },
  { q: 'What does thicker Antarctic ice provide for penguins?',                        correct: 'A safer place for chicks to grow and survive',                 wrong: ['More food inside the ice', 'Faster swimming abilities'] },
  { q: 'Why should we care about Antarctic wildlife?',                                 correct: 'Healthy ecosystems help animals and nature survive together',  wrong: ['Penguins can control the weather', 'Antarctic animals prefer melting ice'] },
  { q: 'Why do emperor penguins huddle together in Antarctica?',                       correct: 'To keep warm during extreme cold',                             wrong: ['To practice swimming', 'To make the ice melt slower'] },
  { q: 'What is an important food source for penguins in Antarctica?',                 correct: 'Fish and krill',                                               wrong: ['Tree leaves', 'Desert insects'] },
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
  left: Math.random() * 96,
  size: 2 + Math.random() * 4,
  duration: 6 + Math.random() * 8,
  delay: -(Math.random() * 14),
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
  const [failFrom,     setFailFrom]     = useState('puzzle'); // puzzle | quiz
  const [stageOneScore,setStageOneScore]= useState(0);

  const livesRef = useRef(MAX_LIVES);
  const processingRef = useRef(false);

  // Audio refs
  const babyAudioRef = useRef(null);
  const correctAudioRef = useRef(null);
  const incorrectAudioRef = useRef(null);
  const bgAudioRef = useRef(null);
  const arBabyLoopRef = useRef(null);

  const inPuzzle = gameState === 'puzzle' || gameState === 'puzzleFeedback';
  const inQuiz   = gameState === 'quiz'   || gameState === 'quizFeedback';
  const moveActive = gameState === 'puzzle' || gameState === 'quiz';
  const gameActive = inPuzzle || inQuiz;

  // ── Audio setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    babyAudioRef.current = new Audio(SOUND_PATHS.baby);
    correctAudioRef.current = new Audio(SOUND_PATHS.correct);
    incorrectAudioRef.current = new Audio(SOUND_PATHS.incorrect);
    bgAudioRef.current = new Audio(SOUND_PATHS.bg);

    bgAudioRef.current.loop = true;
    bgAudioRef.current.volume = 0.35;

    babyAudioRef.current.volume = 0.9;
    correctAudioRef.current.volume = 0.9;
    incorrectAudioRef.current.volume = 0.9;

    return () => {
      if (arBabyLoopRef.current) {
        clearInterval(arBabyLoopRef.current);
        arBabyLoopRef.current = null;
      }

      [babyAudioRef, correctAudioRef, incorrectAudioRef, bgAudioRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
        }
      });
    };
  }, []);

  const playSound = (audioRef) => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // Browser may block audio until user clicks/taps.
    });
  };

  const playBabySound = () => playSound(babyAudioRef);
  const playCorrectSound = () => playSound(correctAudioRef);
  const playIncorrectSound = () => playSound(incorrectAudioRef);

  const startBgMusic = () => {
    if (!bgAudioRef.current) return;

    bgAudioRef.current.currentTime = 0;
    bgAudioRef.current.play().catch(() => {
      // Browser may block autoplay until user interaction.
    });
  };

  const stopBgMusic = () => {
    if (!bgAudioRef.current) return;

    bgAudioRef.current.pause();
    bgAudioRef.current.currentTime = 0;
  };

  const stopArBabyLoop = () => {
    if (arBabyLoopRef.current) {
      clearInterval(arBabyLoopRef.current);
      arBabyLoopRef.current = null;
    }
  };

  const startArBabyLoop = () => {
    stopArBabyLoop();
    playBabySound();

    arBabyLoopRef.current = setInterval(() => {
      playBabySound();
    }, 5000);
  };

  const handleARStatus = (event) => {
    if (event.detail?.status === 'not-presenting') {
      stopArBabyLoop();
    }
  };

  const activateAR = (modelId = 'ar-mv') => {
    const modelViewer = document.getElementById(modelId);
    if (!modelViewer) return;

    startArBabyLoop();

    if (modelViewer.activateAR) {
      modelViewer.activateAR();
    }
  };

  // ── Overall game timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (!gameActive || gameTime <= 0) return;

    const id = setTimeout(() => setGameTime(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [gameActive, gameTime]);

  useEffect(() => {
    if (gameTime === 0 && gameActive) {
      playIncorrectSound();
      stopBgMusic();
      setFailFrom(inQuiz ? 'quiz' : 'puzzle');
      setGameState('fail');
    }
  }, [gameTime, gameActive, inQuiz]);

  // ── Move timer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!moveActive || moveTime <= 0) return;

    const id = setTimeout(() => setMoveTime(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [moveActive, moveTime]);

  useEffect(() => {
    if (moveTime !== 0 || !moveActive || processingRef.current) return;

    processingRef.current = true;
    playIncorrectSound();

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

      if (remaining <= 0) {
        stopBgMusic();
        setFailFrom(gameState === 'quiz' ? 'quiz' : 'puzzle');
        setGameState('fail');
        return;
      }

      setMoveTime(MOVE_SEC);
      setFeedback(null);
      setGameState(resumeState);
    }, 1500);
  }, [moveTime, moveActive, gameState]);

  // ── Start game ────────────────────────────────────────────────────────────
  const startGame = () => {
    stopArBabyLoop();
    startBgMusic();

    livesRef.current = MAX_LIVES;
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
    setFailFrom('puzzle');
    setStageOneScore(0);
    setGameState('puzzle');
  };

  // ── Advance to quiz ───────────────────────────────────────────────────────
  const startQuiz = () => {
    processingRef.current = false;
    setStageOneScore(score);
    setLives(MAX_LIVES);
    livesRef.current = MAX_LIVES;
    setCombo(0);
    setMoveTime(MOVE_SEC);
    setFeedback(null);
    setQuizSet(buildQuizSet());
    setQuizIndex(0);
    setPenguinAnim('idle');
    setGameState('quiz');
  };

  const restartAfterFail = () => {
    stopArBabyLoop();
    startBgMusic();

    livesRef.current = MAX_LIVES;
    processingRef.current = false;
    setLives(MAX_LIVES);
    setCombo(0);
    setMoveTime(MOVE_SEC);
    setGameTime(GAME_SEC);
    setFeedback(null);
    setPenguinAnim('idle');

    if (failFrom === 'quiz') {
      setScore(stageOneScore);
      setQuizSet(buildQuizSet());
      setQuizIndex(0);
      setGameState('quiz');
      return;
    }

    setCurrentRow(ROWS - 1);
    setScore(0);
    setCrackedCells(new Set());
    setSafeCells(new Set());
    setPuzzlePath(buildPath());
    setGameState('puzzle');
  };

  // ── Puzzle cell tap ───────────────────────────────────────────────────────
  const handleCellTap = (row, col) => {
    if (gameState !== 'puzzle' || row !== currentRow || processingRef.current) return;

    processingRef.current = true;

    const correct = col === puzzlePath[row];

    if (correct) {
      playBabySound();

      const newCombo = combo + 1;
      const mult = newCombo >= 3 ? 2 : newCombo >= 2 ? 1.5 : 1;
      const earned = Math.round(10 * mult);

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
          playCorrectSound();
          setGameState('levelComplete');
        } else {
          setCurrentRow(row - 1);
          setMoveTime(MOVE_SEC);
          setFeedback(null);
          setGameState('puzzle');
        }
      }, 1000);
    } else {
      playIncorrectSound();

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

        if (remaining <= 0) {
          stopBgMusic();
          setFailFrom('puzzle');
          setGameState('fail');
          return;
        }

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

    const q = quizSet[quizIndex];
    const correct = optIdx === q.ans;

    if (correct) {
      playBabySound();

      const newCombo = combo + 1;
      const earned = Math.round(20 * (newCombo >= 2 ? 1.5 : 1));

      setCombo(newCombo);
      setScore(s => s + earned);
      setPenguinAnim('walk');
      setFeedback({
        correct: true,
        earned,
        text: `✅ Correct! +${earned} pts`,
        answer: q.opts[q.ans],
      });
    } else {
      playIncorrectSound();

      setCombo(0);

      const remaining = livesRef.current - 1;
      livesRef.current = remaining;
      setLives(remaining);
      setPenguinAnim('shake');
      setFeedback({
        correct: false,
        text: '❌ Wrong! −1 life',
        answer: `Correct: ${q.opts[q.ans]}`,
      });
    }

    setGameState('quizFeedback');

    setTimeout(() => {
      setPenguinAnim('idle');
      processingRef.current = false;

      if (!correct && livesRef.current <= 0) {
        stopBgMusic();
        setFailFrom('quiz');
        setGameState('fail');
        return;
      }

      const next = quizIndex + 1;

      if (next >= quizSet.length) {
        playCorrectSound();
        stopBgMusic();
        setGameState('win');
        return;
      }

      setQuizIndex(next);
      setMoveTime(MOVE_SEC);
      setFeedback(null);
      setGameState('quiz');
    }, 2200);
  };

  // ── Derived display values ────────────────────────────────────────────────
  const livesIcons = Array.from({ length: MAX_LIVES }, (_, i) => i < lives ? '❤️' : '🖤').join('');
  const gMin = Math.floor(gameTime / 60).toString().padStart(2, '0');
  const gSec = (gameTime % 60).toString().padStart(2, '0');
  const movePct = moveTime / MOVE_SEC;
  const moveColor = movePct > 0.5 ? '#4ade80' : movePct > 0.25 ? '#fbbf24' : '#f87171';
  const stepsLeft = currentRow + 1;

  // ── Cube style helper ─────────────────────────────────────────────────────
  const cubeStyle = (rowIndex, colIndex) => {
    const key = `${rowIndex}-${colIndex}`;
    const isCurrent = rowIndex === currentRow;
    const isPast = rowIndex > currentRow;
    const isCracked = crackedCells.has(key);
    const isSafe = safeCells.has(key);
    const isFeedback = gameState === 'puzzleFeedback' && feedback?.row === rowIndex && feedback?.col === colIndex;

    let bg = 'linear-gradient(135deg,rgba(186,230,253,0.18) 0%,rgba(147,197,253,0.10) 100%)';
    let border = 'rgba(147,197,253,0.15)';
    let shadow = '0 3px 0 rgba(0,20,60,0.4),0 4px 8px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.1)';
    let cursor = 'default';
    let anim = 'none';

    if (isSafe) {
      bg = 'linear-gradient(135deg,rgba(52,211,153,0.4),rgba(16,185,129,0.25))';
      border = '#34d399';
      shadow = '0 3px 0 rgba(6,78,59,0.5),0 4px 10px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.2)';
    } else if (isCracked) {
      bg = 'linear-gradient(135deg,rgba(239,68,68,0.35),rgba(220,38,38,0.2))';
      border = '#ef4444';
      shadow = '0 2px 0 rgba(127,29,29,0.5),0 4px 10px rgba(0,0,0,0.3)';
    } else if (isCurrent) {
      bg = 'linear-gradient(135deg,rgba(200,240,255,0.65) 0%,rgba(147,210,253,0.45) 40%,rgba(96,165,250,0.3) 100%)';
      border = 'rgba(147,197,253,0.9)';
      shadow = '0 6px 0 rgba(0,30,100,0.6),0 8px 16px rgba(0,0,0,0.45),inset 0 0 0 1px rgba(255,255,255,0.15),inset 0 1px 0 rgba(255,255,255,0.4)';
      cursor = 'pointer';
      anim = isFeedback && !feedback?.correct ? 'shake 0.6s ease' : 'cubePulse 2s ease-in-out infinite';
    }

    return {
      flex: 1,
      minHeight: 0,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '12px',
      border: `2px solid ${border}`,
      background: bg,
      boxShadow: shadow,
      cursor,
      padding: 0,
      opacity: isPast ? 0.25 : 1,
      transition: 'all 0.25s ease',
      animation: anim,
      WebkitTapHighlightColor: 'transparent',
      touchAction: 'manipulation',
    };
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      width: '100vw',
      height: '100dvh',
      overflow: 'hidden',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      background: 'linear-gradient(160deg,#000820 0%,#001240 50%,#002060 100%)',
      color: 'white',
    }}>

      {/* Snowflakes */}
      <div aria-hidden style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        {SNOWFLAKES.map((f, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: 0,
            left: `${f.left}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            borderRadius: '50%',
            background: `rgba(200,230,255,${f.opacity})`,
            animation: `snowfall ${f.duration}s linear ${f.delay}s infinite`,
          }} />
        ))}
      </div>

      {/* ══ INTRO ══════════════════════════════════════════════════════════════ */}
      {gameState === 'intro' && (
        <div style={{
          position: 'relative',
          zIndex: 10,
          height: '100dvh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px 20px 32px',
          boxSizing: 'border-box',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '6px' }}>
            <h1 style={{
              margin: '2px 0 0',
              fontSize: 'clamp(42px,7vw,36px)',
              fontWeight: '900',
              color: '#bfdbfe',
              textShadow: '0 0 30px rgba(96,165,250,0.7)',
              lineHeight: 1.1,
            }}>
              ICE SWEET ICE
            </h1>
            <div style={{ fontSize: '14px', color: '#7dd3fc', marginTop: '2px' }}>
              🐧 Antarctic Rescue Mission
            </div>
          </div>

          <div style={{
            width: '100%',
            maxWidth: '280px',
            height: '190px',
            borderRadius: '20px',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.04)',
            border: '1.5px solid rgba(147,197,253,0.4)',
            margin: '12px 0',
          }}>
            <model-viewer
              id="ar-mv"
              src="/models/walking_emperor_penguin_chick.glb"
              ios-src="/models/Walking_Emperor_Penguin_Chick.usdz"
              ar
              ar-modes="webxr scene-viewer quick-look"
              ar-placement="floor"
              ar-scale="fixed"
              camera-controls
              autoplay
              animation-name="walk"
              scale="5 5 5"
              onArStatus={handleARStatus}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'transparent',
              }}
            ></model-viewer>
          </div>

          {/* 2-stage brief */}
          <div style={{
            width: '100%',
            maxWidth: '300px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(147,197,253,0.25)',
            borderRadius: '16px',
            padding: '14px 16px',
            marginBottom: '12px',
            boxSizing: 'border-box',
          }}>
            <p style={{
              margin: '0 0 8px',
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#93c5fd',
            }}>
              🐧 Mission Brief
            </p>

            <p style={{
              margin: '0 0 8px',
              fontSize: '12px',
              color: '#cbd5e1',
              lineHeight: 1.6,
            }}>
              Baby penguin <strong>ICY&apos;S BABY</strong> must complete <strong>2 stages</strong> to reunite with its parents!
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <div style={{
                flex: 1,
                background: 'rgba(96,165,250,0.15)',
                border: '1px solid rgba(96,165,250,0.4)',
                borderRadius: '10px',
                padding: '8px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '18px' }}>🧊</div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#7dd3fc' }}>STAGE 1</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.3 }}>
                  Ice Cube Puzzle<br />Cross 5 rows safely
                </div>
              </div>

              <div style={{
                flex: 1,
                background: 'rgba(167,139,250,0.15)',
                border: '1px solid rgba(167,139,250,0.4)',
                borderRadius: '10px',
                padding: '8px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '18px' }}>🧠</div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#c4b5fd' }}>STAGE 2</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.3 }}>
                  Antarctic Quiz<br />Answer 5 questions
                </div>
              </div>
            </div>

            <p style={{
              margin: 0,
              fontSize: '11px',
              color: '#60a5fa',
              lineHeight: 1.6,
            }}>
              ⏱️ 3 min total · ❤️×5 lives · 🦭 20s per move
            </p>
          </div>

          <button onClick={() => activateAR('ar-mv')} style={{
            padding: '9px 22px',
            background: 'rgba(29,78,216,0.7)',
            color: 'white',
            border: '1px solid #93c5fd',
            borderRadius: '18px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '10px',
          }}>
            📱 Preview ICY&apos;S BABY in AR
          </button>

          <button onClick={startGame} style={{
            padding: '15px 48px',
            background: 'linear-gradient(135deg,#1d4ed8,#2563eb)',
            color: 'white',
            border: '2px solid #93c5fd',
            borderRadius: '36px',
            fontSize: '17px',
            fontWeight: '900',
            cursor: 'pointer',
            boxShadow: '0 4px 28px rgba(37,99,235,0.6)',
            letterSpacing: '1px',
            WebkitTapHighlightColor: 'transparent',
          }}>
            🚀 BEGIN RESCUE
          </button>
        </div>
      )}

      {/* ══ LEVEL COMPLETE ════════════════════════════════════════════════════ */}
      {gameState === 'levelComplete' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,15,50,0.97)',
          backdropFilter: 'blur(10px)',
          padding: '24px',
          boxSizing: 'border-box',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '52px', marginBottom: '28px' }}>🧊✅</div>

          <h2 style={{
            margin: '0 0 4px',
            fontSize: '24px',
            fontWeight: '900',
            color: '#4ade80',
            textShadow: '0 0 20px rgba(74,222,128,0.5)',
          }}>
            STAGE 1 COMPLETE!
          </h2>

          <p style={{
            margin: '0 0 12px',
            fontSize: '13px',
            color: '#86efac',
            lineHeight: 1.6,
            maxWidth: '250px',
          }}>
            ICY&apos;S BABY crossed the ice field! But the family reunion isn&apos;t over — the parents need proof you know the Antarctic!
          </p>

          <div style={{
            background: 'rgba(167,139,250,0.15)',
            border: '1.5px solid rgba(167,139,250,0.5)',
            borderRadius: '14px',
            padding: '12px 20px',
            marginBottom: '16px',
            width: '100%',
            maxWidth: '280px',
            boxSizing: 'border-box',
          }}>
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>🧠</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#c4b5fd' }}>
              STAGE 2 — Antarctic Quiz
            </div>
            <div style={{
              fontSize: '12px',
              color: '#94a3b8',
              marginTop: '4px',
            }}>
              Answer 5 randomised questions correctly to reunite ICY&apos;S BABY with its family!
            </div>
          </div>

          <div style={{
            fontSize: '36px',
            fontWeight: '900',
            color: '#fde68a',
            marginBottom: '4px',
          }}>
            {score}
          </div>

          <p style={{ margin: '0 0 18px', fontSize: '11px', color: '#94a3b8' }}>
            Score so far · {livesIcons}
          </p>

          <button onClick={startQuiz} style={{
            padding: '14px 44px',
            background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
            color: 'white',
            border: '2px solid #c4b5fd',
            borderRadius: '32px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}>
            🧠 Start Quiz →
          </button>
        </div>
      )}

      {/* ══ PUZZLE SCREEN ══════════════════════════════════════════════════════ */}
      {inPuzzle && (
        <div style={{
          position: 'relative',
          zIndex: 10,
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '8px 10px 6px',
          boxSizing: 'border-box',
          gap: '5px',
        }}>

          {/* HUD */}
          <div style={{
            width: '100%',
            maxWidth: '400px',
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.7)',
              borderRadius: '12px',
              padding: '5px 10px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#fde68a',
            }}>
              ⏰ {gMin}:{gSec}
            </div>

            <div style={{
              background: 'rgba(96,165,250,0.2)',
              border: '1px solid rgba(96,165,250,0.4)',
              borderRadius: '12px',
              padding: '5px 12px',
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#7dd3fc',
              textAlign: 'center',
            }}>
              🧊 STAGE 1 · ICE PUZZLE
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.7)',
              borderRadius: '12px',
              padding: '5px 10px',
              fontSize: '12px',
            }}>
              {livesIcons}
            </div>
          </div>

          {/* Score panel only - 3D penguin and AR button removed from this screen */}
          <div style={{
            width: '100%',
            maxWidth: '400px',
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.05)',
            border: '1.5px solid rgba(147,197,253,0.25)',
            borderRadius: '14px',
            padding: '8px 12px',
            boxSizing: 'border-box',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '11px',
                color: '#93c5fd',
                marginBottom: '2px',
              }}>
                ICY the Baby Penguin
              </div>

              <div style={{
                fontSize: '22px',
                fontWeight: '900',
                color: '#fde68a',
                lineHeight: 1,
              }}>
                🏆 {score}
              </div>

              {combo >= 2 && (
                <div style={{
                  fontSize: '10px',
                  color: '#fbbf24',
                  marginTop: '3px',
                  fontWeight: 'bold',
                }}>
                  🔥 ×{combo >= 3 ? '2.0' : '1.5'} COMBO!
                </div>
              )}

              <div style={{
                fontSize: '10px',
                color: '#60a5fa',
                marginTop: '3px',
              }}>
                {stepsLeft} step{stepsLeft !== 1 ? 's' : ''} left
              </div>
            </div>
          </div>

          {/* Board */}
          <div style={{
            flex: 1,
            width: '100%',
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            overflow: 'hidden',
            minHeight: 0,
          }}>

            {/* GOAL */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              flexShrink: 0,
              height: '40px',
              background: 'linear-gradient(90deg,rgba(74,222,128,0.05),rgba(74,222,128,0.2),rgba(74,222,128,0.05))',
              borderRadius: '12px',
              border: '1.5px solid rgba(74,222,128,0.6)',
            }}>
              <span style={{
                fontSize: '9px',
                fontWeight: 'bold',
                color: '#4ade80',
                letterSpacing: '1px',
              }}>
                🏁 GOAL
              </span>

              <span style={{ fontSize: '28px' }}>🐧🐧</span>

              <span style={{
                fontSize: '9px',
                fontWeight: 'bold',
                color: '#4ade80',
                letterSpacing: '1px',
              }}>
                PARENTS WAIT
              </span>
            </div>

            {/* Grid */}
            {Array.from({ length: ROWS }, (_, rowIndex) => (
              <div key={rowIndex} style={{
                display: 'flex',
                gap: '5px',
                flex: 1,
                minHeight: 0,
              }}>
                {Array.from({ length: COLS }, (_, colIndex) => {
                  const isCurrent = rowIndex === currentRow;
                  const key = `${rowIndex}-${colIndex}`;
                  const isSafe = safeCells.has(key);
                  const isCracked = crackedCells.has(key);
                  const isFBCell = gameState === 'puzzleFeedback' && feedback?.row === rowIndex && feedback?.col === colIndex;

                  return (
                    <button
                      key={key}
                      onClick={() => handleCellTap(rowIndex, colIndex)}
                      style={cubeStyle(rowIndex, colIndex)}
                    >
                      <span style={{
                        fontSize: isCurrent ? '26px' : '16px',
                        lineHeight: 1,
                        transition: 'font-size 0.2s',
                        pointerEvents: 'none',
                      }}>
                        {isCracked ? '💥' : isSafe ? '✅' : '🧊'}
                      </span>

                      {/* Baby penguin indicator on current row centre */}
                      {isCurrent && colIndex === 1 && (
                        <span style={{
                          position: 'absolute',
                          top: '-18px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '22px',
                          lineHeight: 1,
                          pointerEvents: 'none',
                          animation: penguinAnim === 'walk' ? 'penguinWalk 1s ease forwards' : 'babyFloat 2.5s ease-in-out infinite',
                          filter: 'drop-shadow(0 0 8px rgba(96,165,250,0.95)) drop-shadow(0 0 3px #fff)',
                        }}>
                          🐧
                        </span>
                      )}

                      {/* Score popup */}
                      {isFBCell && feedback?.correct && (
                        <span style={{
                          position: 'absolute',
                          top: '-22px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: '#4ade80',
                          animation: 'scoreRise 1s ease forwards',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                        }}>
                          +{feedback.earned}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Sea lion move timer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexShrink: 0,
              height: '32px',
              background: 'rgba(239,68,68,0.08)',
              borderRadius: '10px',
              border: `1px solid ${moveTime < 4 ? 'rgba(239,68,68,0.9)' : 'rgba(239,68,68,0.25)'}`,
              padding: '0 10px',
              animation: moveTime < 4 ? 'dangerPulse 0.5s ease infinite' : 'none',
              transition: 'border-color 0.3s',
            }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>🦭</span>

              <div style={{
                flex: 1,
                height: '5px',
                background: 'rgba(239,68,68,0.15)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${movePct * 100}%`,
                  background: moveColor,
                  borderRadius: '3px',
                  transition: 'width 1s linear, background 0.3s',
                }} />
              </div>

              <span style={{
                fontSize: '10px',
                color: moveColor,
                fontWeight: 'bold',
                flexShrink: 0,
              }}>
                {moveTime}s
              </span>
            </div>
          </div>

          {/* Feedback */}
          {gameState === 'puzzleFeedback' && feedback && (
            <div style={{
              width: '100%',
              maxWidth: '400px',
              flexShrink: 0,
              padding: '7px 14px',
              borderRadius: '12px',
              textAlign: 'center',
              background: feedback.correct ? 'rgba(52,211,153,0.18)' : 'rgba(239,68,68,0.18)',
              border: `1.5px solid ${feedback.correct ? '#34d399' : '#ef4444'}`,
              animation: 'slideUp 0.3s ease',
              boxSizing: 'border-box',
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '900',
                color: feedback.correct ? '#6ee7b7' : '#fca5a5',
              }}>
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
        <div style={{
          position: 'relative',
          zIndex: 10,
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '8px 12px 10px',
          boxSizing: 'border-box',
          gap: '8px',
        }}>

          {/* HUD */}
          <div style={{
            width: '100%',
            maxWidth: '400px',
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.7)',
              borderRadius: '12px',
              padding: '5px 10px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#fde68a',
            }}>
              ⏰ {gMin}:{gSec}
            </div>

            <div style={{
              background: 'rgba(167,139,250,0.2)',
              border: '1px solid rgba(167,139,250,0.4)',
              borderRadius: '12px',
              padding: '5px 12px',
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#c4b5fd',
            }}>
              🧠 STAGE 2 · QUIZ
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.7)',
              borderRadius: '12px',
              padding: '5px 10px',
              fontSize: '12px',
            }}>
              {livesIcons}
            </div>
          </div>

          {/* Quiz score panel only - 3D penguin removed */}
          <div style={{
            width: '100%',
            maxWidth: '400px',
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.05)',
            border: '1.5px solid rgba(167,139,250,0.25)',
            borderRadius: '14px',
            padding: '10px 14px',
            boxSizing: 'border-box',
          }}>
            <div>
              <div style={{
                fontSize: '11px',
                color: '#c4b5fd',
                marginBottom: '3px',
              }}>
                ICY&apos;S BABY awaits the answer...
              </div>

              <div style={{
                fontSize: '22px',
                fontWeight: '900',
                color: '#fde68a',
                lineHeight: 1,
              }}>
                🏆 {score}
              </div>

              {combo >= 2 && (
                <div style={{
                  fontSize: '10px',
                  color: '#fbbf24',
                  marginTop: '3px',
                  fontWeight: 'bold',
                }}>
                  🔥 COMBO!
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              alignItems: 'center',
            }}>
              <div style={{ fontSize: '9px', color: '#94a3b8' }}>
                Q{quizIndex + 1}/5
              </div>

              <div style={{ display: 'flex', gap: '3px' }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: i < quizIndex ? '#4ade80' : i === quizIndex ? '#c4b5fd' : 'rgba(255,255,255,0.15)',
                  }} />
                ))}
              </div>
            </div>
          </div>

          {/* Question card */}
          <div style={{
            width: '100%',
            maxWidth: '400px',
            flexShrink: 0,
            background: 'rgba(255,255,255,0.07)',
            border: '1.5px solid rgba(167,139,250,0.35)',
            borderRadius: '16px',
            padding: '14px 16px',
            boxSizing: 'border-box',
          }}>
            <div style={{
              fontSize: '10px',
              color: '#a78bfa',
              fontWeight: 'bold',
              marginBottom: '6px',
              letterSpacing: '1px',
            }}>
              🧊 PENGUIN KNOWLEDGE CHECK
            </div>

            <p style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#e2e8f0',
              lineHeight: 1.5,
            }}>
              {quizSet[quizIndex]?.q}
            </p>
          </div>

          {/* Answer options */}
          <div style={{
            width: '100%',
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flex: 1,
            justifyContent: 'center',
          }}>
            {quizSet[quizIndex]?.opts.map((opt, i) => {
              const isFBOpt = gameState === 'quizFeedback' && feedback;
              const isCorrectOpt = isFBOpt && i === quizSet[quizIndex].ans;

              let bg = 'rgba(255,255,255,0.07)';
              let border = 'rgba(147,197,253,0.3)';
              let color = '#e2e8f0';

              if (isCorrectOpt) {
                bg = 'rgba(52,211,153,0.2)';
                border = '#34d399';
                color = '#6ee7b7';
              }

              return (
                <button key={i} onClick={() => handleQuizAnswer(i)} style={{
                  width: '100%',
                  padding: '13px 16px',
                  background: bg,
                  border: `1.5px solid ${border}`,
                  borderRadius: '12px',
                  color,
                  fontSize: '13px',
                  fontWeight: 'bold',
                  textAlign: 'left',
                  cursor: gameState === 'quiz' ? 'pointer' : 'default',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                }}>
                  <span style={{ marginRight: '8px', color: '#60a5fa' }}>
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Sea lion move timer */}
          <div style={{
            width: '100%',
            maxWidth: '400px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            height: '30px',
            background: 'rgba(239,68,68,0.08)',
            borderRadius: '10px',
            border: `1px solid ${moveTime < 4 ? 'rgba(239,68,68,0.9)' : 'rgba(239,68,68,0.25)'}`,
            padding: '0 10px',
            animation: moveTime < 4 ? 'dangerPulse 0.5s ease infinite' : 'none',
            transition: 'border-color 0.3s',
            boxSizing: 'border-box',
          }}>
            <span style={{ fontSize: '14px' }}>🦭</span>

            <div style={{
              flex: 1,
              height: '5px',
              background: 'rgba(239,68,68,0.15)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${movePct * 100}%`,
                background: moveColor,
                borderRadius: '3px',
                transition: 'width 1s linear, background 0.3s',
              }} />
            </div>

            <span style={{
              fontSize: '10px',
              color: moveColor,
              fontWeight: 'bold',
            }}>
              {moveTime}s
            </span>
          </div>

          {/* Quiz feedback */}
          {gameState === 'quizFeedback' && feedback && (
            <div style={{
              width: '100%',
              maxWidth: '400px',
              flexShrink: 0,
              padding: '8px 14px',
              borderRadius: '12px',
              textAlign: 'center',
              background: feedback.correct ? 'rgba(52,211,153,0.18)' : 'rgba(239,68,68,0.18)',
              border: `1.5px solid ${feedback.correct ? '#34d399' : '#ef4444'}`,
              animation: 'slideUp 0.3s ease',
              boxSizing: 'border-box',
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '900',
                color: feedback.correct ? '#6ee7b7' : '#fca5a5',
              }}>
                {feedback.text}
              </div>

              {feedback.answer && !feedback.correct && (
                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  marginTop: '3px',
                }}>
                  {feedback.answer}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══ WIN ════════════════════════════════════════════════════════════════ */}
      {gameState === 'win' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,20,50,0.97)',
          backdropFilter: 'blur(10px)',
          padding: '24px',
          boxSizing: 'border-box',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '52px', marginBottom: '28px' }}>🎊</div>

          <h2 style={{
            margin: '0 0 4px',
            fontSize: '28px',
            fontWeight: '900',
            color: '#4ade80',
            textShadow: '0 0 20px rgba(74,222,128,0.6)',
          }}>
            FAMILY REUNITED!
          </h2>

          <p style={{
            margin: '0 0 6px',
            fontSize: '13px',
            color: '#86efac',
            maxWidth: '260px',
            lineHeight: 1.6,
          }}>
            ICY&apos;S BABY crossed the ice field AND passed the Antarctic quiz! The sea lion retreats in defeat. 🦭🚫
          </p>

          <div style={{ fontSize: '26px', margin: '6px 0' }}>
            🐧👨‍👩‍👧‍👦 ❄️🏔️
          </div>

          <div style={{
            fontSize: '54px',
            fontWeight: '900',
            color: '#fde68a',
            lineHeight: 1,
            marginBottom: '4px',
          }}>
            {score}
          </div>

          <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#94a3b8' }}>
            FINAL SCORE
          </p>

          <p style={{
            margin: '0 0 14px',
            fontSize: '13px',
            color: score >= 200 ? '#4ade80' : score >= 100 ? '#fbbf24' : '#94a3b8',
          }}>
            {score >= 200 ? '⭐⭐⭐ Antarctic Legend!' : score >= 100 ? '⭐⭐ Excellent Rescuer!' : '⭐ Well done, hero!'}
          </p>

          <div style={{
            width: '210px',
            height: '145px',
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.05)',
            border: '1.5px solid rgba(74,222,128,0.45)',
            marginBottom: '18px',
          }}>
            <model-viewer
              id="ar-end-mv"
              src="/models/penguin1.glb"
              ios-src="/models/penguin1.usdz"
              ar
              ar-modes="webxr scene-viewer quick-look"
              ar-placement="floor"
              camera-controls
              autoplay
              scale="8 8 8"
              onArStatus={handleARStatus}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'transparent',
              }}
            ></model-viewer>
          </div>

          <button onClick={() => activateAR('ar-end-mv')} style={{
            padding: '9px 22px',
            background: 'rgba(29,78,216,0.7)',
            color: 'white',
            border: '1px solid #93c5fd',
            borderRadius: '18px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '10px',
          }}>
            📱 View Baby Penguin in AR
          </button>

          <button onClick={startGame} style={{
            padding: '14px 44px',
            background: 'linear-gradient(135deg,#16a34a,#22c55e)',
            color: 'white',
            border: '2px solid #86efac',
            borderRadius: '32px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}>
            🔄 Play Again
          </button>
        </div>
      )}

      {/* ══ FAIL ═══════════════════════════════════════════════════════════════ */}
      {gameState === 'fail' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(10,0,0,0.97)',
          backdropFilter: 'blur(10px)',
          padding: '24px',
          boxSizing: 'border-box',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '52px', marginBottom: '8px' }}>🦭</div>

          <h2 style={{
            margin: '0 0 4px',
            fontSize: '26px',
            fontWeight: '900',
            color: '#f87171',
          }}>
            {gameTime === 0 ? 'TIME\'S UP!' : 'CAUGHT!'}
          </h2>

          <p style={{
            margin: '0 0 8px',
            fontSize: '14px',
            color: '#fca5a5',
            lineHeight: 1.6,
            maxWidth: '260px',
          }}>
            {gameTime === 0
              ? 'The 3-minute rescue window expired!'
              : failFrom === 'quiz'
                ? 'The quiz attempt failed. Try Stage 2 again and help ICY&apos;S BABY finish the rescue!'
                : 'The sea lion caught ICY before it could reach its parents...'}
          </p>

          <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b' }}>
            Score: <strong style={{ color: '#fde68a' }}>{score}</strong>
          </p>

          <div style={{ fontSize: '32px', marginBottom: '22px' }}>
            ❄️💔🐧
          </div>

          <button onClick={restartAfterFail} style={{
            padding: '14px 44px',
            background: 'linear-gradient(135deg,#1d4ed8,#2563eb)',
            color: 'white',
            border: '2px solid #93c5fd',
            borderRadius: '32px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}>
            {failFrom === 'quiz' ? '🔄 Retry Quiz' : '🔄 Try Again'}
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
          0% {
            transform: translateX(-50%) translateY(0) scale(1);
            filter: drop-shadow(0 0 8px rgba(96,165,250,0.95)) drop-shadow(0 0 3px #fff);
          }

          30% {
            transform: translateX(-50%) translateY(-16px) scale(1.3);
            filter: drop-shadow(0 0 16px rgba(96,165,250,1)) drop-shadow(0 0 6px #fff);
          }

          60% {
            transform: translateX(-50%) translateY(-10px) scale(1.1);
          }

          100% {
            transform: translateX(-50%) translateY(-24px) scale(0.85);
            opacity: 0;
          }
        }

        @keyframes babyFloat {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50%     { transform: translateX(-50%) translateY(-7px); }
        }

        @keyframes cubePulse {
          0%,100% {
            box-shadow:
              0 6px 0 rgba(0,30,100,0.6),
              0 8px 16px rgba(0,0,0,0.45),
              inset 0 0 0 1px rgba(255,255,255,0.15),
              inset 0 1px 0 rgba(255,255,255,0.4);
          }

          50% {
            box-shadow:
              0 6px 0 rgba(0,30,100,0.6),
              0 8px 20px rgba(0,0,0,0.5),
              0 0 18px rgba(96,165,250,0.35),
              inset 0 0 0 1px rgba(255,255,255,0.2),
              inset 0 1px 0 rgba(255,255,255,0.5);
          }
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