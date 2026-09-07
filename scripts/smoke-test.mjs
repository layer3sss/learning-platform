#!/usr/bin/env node
/**
 * DevOps Learning OS - API smoke test
 * Runs against a live server:  node scripts/smoke-test.mjs [baseUrl]
 * Default base URL: http://localhost:3000
 *
 * Expects a FRESH store (newly created DB or restarted in-memory server)
 * for the seeding assertions to hold. In Postgres mode it creates its own
 * uniquely-named test user so it can run against a dirty database too,
 * except for the two demo-seed assertions which are skipped in that case
 * (pass --dirty to skip them explicitly).
 */

const BASE = process.argv[2] || process.env.BASE_URL || 'http://localhost:3000';
const DIRTY = process.argv.includes('--dirty');

let passed = 0;
let failed = 0;
const failures = [];

function check(name, cond, detail = '') {
  if (cond) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    failures.push(name);
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function req(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

async function main() {
  console.log(`\nSmoke testing DevOps Learning OS at ${BASE}\n`);

  // ---------- Health ----------
  console.log('Health');
  const health = await req('GET', '/api/health');
  check('GET /api/health -> 200', health.status === 200, `got ${health.status}`);
  check('health reports ok status', health.data?.status === 'ok');
  check('health reports store mode', ['memory', 'postgres'].includes(health.data?.store?.mode), JSON.stringify(health.data?.store));
  const storeMode = health.data?.store?.mode;
  console.log(`  (store mode: ${storeMode})\n`);

  // ---------- Auth: register ----------
  console.log('Authentication');
  const uniq = `${Date.now()}${Math.floor(Math.random() * 1e6)}`;
  const testEmail = `smoke-${uniq}@example.com`;
  const reg = await req('POST', '/api/auth/register', {
    body: { name: 'Smoke Tester', email: testEmail, password: 'secret123' }
  });
  check('POST /api/auth/register -> 201', reg.status === 201, `got ${reg.status}`);
  check('register returns user', reg.data?.user?.email === testEmail);
  check('register returns token', typeof reg.data?.token === 'string' && reg.data.token.length > 20);
  check('register user has no password hash leak', !('password' in (reg.data?.user ?? {})) && !('passwordHash' in (reg.data?.user ?? {})));
  const userToken = reg.data.token;

  const regDup = await req('POST', '/api/auth/register', {
    body: { name: 'Smoke Tester', email: testEmail, password: 'secret123' }
  });
  check('duplicate register -> 400', regDup.status === 400, `got ${regDup.status}`);

  const regShortPw = await req('POST', '/api/auth/register', {
    body: { name: 'X', email: `short-${uniq}@example.com`, password: '123' }
  });
  check('short password -> 400', regShortPw.status === 400, `got ${regShortPw.status}`);

  const regMissing = await req('POST', '/api/auth/register', { body: { email: 'x@x.com' } });
  check('missing fields -> 400', regMissing.status === 400, `got ${regMissing.status}`);

  // ---------- Auth: login ----------
  const login = await req('POST', '/api/auth/login', {
    body: { email: testEmail, password: 'secret123' }
  });
  check('login -> 200', login.status === 200, `got ${login.status}`);
  check('login returns token', typeof login.data?.token === 'string');

  const loginBad = await req('POST', '/api/auth/login', {
    body: { email: testEmail, password: 'wrong-password' }
  });
  check('wrong password -> 401', loginBad.status === 401, `got ${loginBad.status}`);

  // ---------- Auth: me ----------
  const me = await req('GET', '/api/auth/me', { token: userToken });
  check('GET /api/auth/me -> 200', me.status === 200, `got ${me.status}`);
  check('me returns correct user', me.data?.user?.email === testEmail);

  const meNoToken = await req('GET', '/api/auth/me');
  check('me without token -> 401', meNoToken.status === 401, `got ${meNoToken.status}`);

  const meBadToken = await req('GET', '/api/auth/me', { token: 'not-a-real-token' });
  check('me with garbage token -> 401', meBadToken.status === 401, `got ${meBadToken.status}`);

  // ---------- Learning state ----------
  console.log('\nLearning state');
  const ls = await req('GET', '/api/learning-state', { token: userToken });
  check('GET /api/learning-state -> 200', ls.status === 200, `got ${ls.status}`);
  check('learning state seeded (level 0)', ls.data?.currentRoadmapLevel === 0);
  check('learning state has current task', typeof ls.data?.currentTaskId === 'string' && ls.data.currentTaskId.length > 0);
  const lsId = ls.data?.id;

  const lsPut = await req('PUT', '/api/learning-state', {
    token: userToken,
    body: { currentObjective: 'Smoke-test objective', id: 'HACKED', userId: 'HACKED' }
  });
  check('PUT /api/learning-state -> 200', lsPut.status === 200, `got ${lsPut.status}`);
  check('objective updated', lsPut.data?.currentObjective === 'Smoke-test objective');
  check('id not overwritable', lsPut.data?.id === lsId, `got ${lsPut.data?.id}`);
  check('userId not overwritable', lsPut.data?.userId && lsPut.data.userId !== 'HACKED');

  // ---------- Roadmap ----------
  console.log('\nRoadmap');
  const roadmap = await req('GET', '/api/roadmap', { token: userToken });
  check('GET /api/roadmap -> 200', roadmap.status === 200, `got ${roadmap.status}`);
  check('roadmap is non-empty array', Array.isArray(roadmap.data) && roadmap.data.length > 0);
  check('roadmap covers Levels 0-13 (14 levels)', Array.isArray(roadmap.data) && roadmap.data.length === 14,
    `got ${roadmap.data?.length} levels`);
  const levelNums = (roadmap.data || []).map(l => l.levelNumber).sort((a, b) => a - b);
  check('level numbers are exactly 0..13', levelNums.join(',') === Array.from({ length: 14 }, (_, i) => i).join(','),
    `got ${levelNums.join(',')}`);
  const level0 = roadmap.data?.[0];
  const firstTask = level0?.projects?.[0]?.tasks?.[0];
  check('roadmap level 0 has projects/tasks', Boolean(firstTask));
  check('seeded task is IN_PROGRESS', firstTask?.userStatus === 'IN_PROGRESS', `got ${firstTask?.userStatus}`);

  // ---------- Task status ----------
  console.log('\nTask status');
  const taskDone = await req('PUT', `/api/tasks/${firstTask.id}/status`, {
    token: userToken,
    body: { status: 'COMPLETED', notes: 'finished by smoke test' }
  });
  check('PUT task status -> 200', taskDone.status === 200, `got ${taskDone.status}`);
  check('record reflects COMPLETED', taskDone.data?.record?.status === 'COMPLETED');
  check('learning state mirrors task status', taskDone.data?.learningState?.currentTaskStatus === 'COMPLETED');
  check('completion date set', typeof taskDone.data?.record?.completionDate === 'string');

  const roadmapAfter = await req('GET', '/api/roadmap', { token: userToken });
  const taskAfter = roadmapAfter.data?.[0]?.projects?.[0]?.tasks?.find(t => t.id === firstTask.id);
  check('roadmap reflects completed task', taskAfter?.userStatus === 'COMPLETED');

  const taskBad = await req('PUT', `/api/tasks/${firstTask.id}/status`, {
    token: userToken,
    body: { status: 'NOT_A_STATUS' }
  });
  check('invalid task status -> 400', taskBad.status === 400, `got ${taskBad.status}`);

  // ---------- Skills ----------
  console.log('\nSkills');
  const skills = await req('GET', '/api/skills', { token: userToken });
  check('GET /api/skills -> 200', skills.status === 200, `got ${skills.status}`);
  check('allSkills catalog present', Array.isArray(skills.data?.allSkills) && skills.data.allSkills.length > 0);
  check('user skills seeded', Array.isArray(skills.data?.userSkills) && skills.data.userSkills.length > 0);
  const linuxSkill = skills.data.userSkills.find(s => s.skillId === 'skill-linux');
  check('seeded Linux skill level 2', linuxSkill?.level === 2, `got ${linuxSkill?.level}`);

  const skillUp = await req('PUT', '/api/skills/skill-docker', {
    token: userToken,
    body: { level: 3, notes: 'smoke test bump' }
  });
  check('PUT skill -> 200', skillUp.status === 200, `got ${skillUp.status}`);
  check('skill level updated', skillUp.data?.level === 3);
  check('skill name resolved from catalog', skillUp.data?.skillName === 'Docker & Containerization');

  const skillBad = await req('PUT', '/api/skills/skill-docker', { token: userToken, body: { level: 'banana' } });
  check('non-numeric skill level -> 400', skillBad.status === 400, `got ${skillBad.status}`);
  const skillRange = await req('PUT', '/api/skills/skill-docker', { token: userToken, body: { level: 99 } });
  check('out-of-range skill level -> 400', skillRange.status === 400, `got ${skillRange.status}`);

  // ---------- Assessments ----------
  console.log('\nAssessments');
  const assess = await req('POST', '/api/assessments', {
    token: userToken,
    body: {
      taskTitle: firstTask.title,
      taskId: firstTask.id,
      status: 'PASSED',
      summary: 'Solid terminal configuration work',
      strengths: ['clean aliases', 'PATH verified'],
      weaknesses: [],
      mistakes: ['forgot to source .zshrc'],
      conceptsToPractice: ['shell startup order'],
      recommendedNextTask: 'Generate ed25519 keypair',
      aiTeacherName: 'SmokeBot',
      demonstratedSkills: [{ skillId: 'skill-bash', skillName: 'Bash Scripting', demonstratedLevel: 3 }]
    }
  });
  check('POST assessment -> 201', assess.status === 201, `got ${assess.status}`);
  check('assessment saved with id', typeof assess.data?.id === 'string');

  const assessList = await req('GET', '/api/assessments', { token: userToken });
  check('GET assessments -> 200 with 1 entry', assessList.status === 200 && Array.isArray(assessList.data) && assessList.data.length === 1);
  check('strengths stored as array', Array.isArray(assessList.data?.[0]?.strengths) && assessList.data[0].strengths.length === 2);

  // Assessment side effects: skill bump + learning state update
  const skillsAfter = await req('GET', '/api/skills', { token: userToken });
  const bashAfter = skillsAfter.data.userSkills.find(s => s.skillId === 'skill-bash');
  check('assessment bumped demonstrated skill to 3', bashAfter?.level === 3, `got ${bashAfter?.level}`);

  const lsAfterAssess = await req('GET', '/api/learning-state', { token: userToken });
  check('learning state records assessment summary', lsAfterAssess.data?.lastAssessmentSummary?.includes('PASSED') === true);
  check('PASSED assessment completes current task', lsAfterAssess.data?.currentTaskStatus === 'COMPLETED', `got ${lsAfterAssess.data?.currentTaskStatus}`);
  check('next recommended task stored', lsAfterAssess.data?.nextRecommendedTask === 'Generate ed25519 keypair');

  const assessBad = await req('POST', '/api/assessments', { token: userToken, body: { status: 'GREAT' } });
  check('missing summary -> 400', assessBad.status === 400, `got ${assessBad.status}`);
  const assessBadStatus = await req('POST', '/api/assessments', { token: userToken, body: { summary: 'x', status: 'GREAT' } });
  check('invalid status -> 400', assessBadStatus.status === 400, `got ${assessBadStatus.status}`);

  // ---------- Journal ----------
  console.log('\nJournal');
  const jEmpty = await req('GET', '/api/journal', { token: userToken });
  check('new user journal has seed entry', jEmpty.status === 200 && Array.isArray(jEmpty.data));
  const jCreate = await req('POST', '/api/journal', {
    token: userToken,
    body: { title: 'Smoke journal entry', content: 'Learned that docker layers cache.', tags: ['docker', 'smoke'] }
  });
  check('POST journal -> 201', jCreate.status === 201, `got ${jCreate.status}`);
  const jList = await req('GET', '/api/journal', { token: userToken });
  check('journal contains new entry', jList.data?.some(e => e.title === 'Smoke journal entry'));
  const jBad = await req('POST', '/api/journal', { token: userToken, body: { title: 'no content' } });
  check('journal missing content -> 400', jBad.status === 400, `got ${jBad.status}`);

  // ---------- Evidence ----------
  console.log('\nEvidence');
  const eCreate = await req('POST', '/api/evidence', {
    token: userToken,
    body: { title: 'Smoke evidence', url: 'https://github.com/example/repo', githubRepo: 'https://github.com/example/repo' }
  });
  check('POST evidence -> 201', eCreate.status === 201, `got ${eCreate.status}`);
  const eList = await req('GET', '/api/evidence', { token: userToken });
  check('evidence contains new entry', eList.data?.some(e => e.title === 'Smoke evidence'));
  const eBad = await req('POST', '/api/evidence', { token: userToken, body: { description: 'no title' } });
  check('evidence missing title -> 400', eBad.status === 400, `got ${eBad.status}`);

  // ---------- AI context ----------
  console.log('\nAI context');
  const aiCtx = await req('GET', '/api/ai-context', { token: userToken });
  check('GET /api/ai-context -> 200', aiCtx.status === 200, `got ${aiCtx.status}`);
  check('markdown contains learner name', aiCtx.data?.formattedMarkdown?.includes('Smoke Tester') === true);
  check('markdown contains instructions', aiCtx.data?.instructionsForAI?.includes('mentor') === true);
  check('demonstrated skills listed', Array.isArray(aiCtx.data?.demonstratedSkills) && aiCtx.data.demonstratedSkills.length > 0);

  // ---------- Admin ----------
  console.log('\nAdmin & authorization');
  const adminForbidden = await req('GET', '/api/admin/users', { token: userToken });
  check('non-admin blocked from admin route -> 403', adminForbidden.status === 403, `got ${adminForbidden.status}`);

  const demoAdmin = await req('POST', '/api/auth/switch-demo', { body: { targetRole: 'ADMIN' } });
  check('switch-demo to admin -> 200', demoAdmin.status === 200, `got ${demoAdmin.status}`);
  check('demo admin has ADMIN role', demoAdmin.data?.user?.role === 'ADMIN');
  const adminToken = demoAdmin.data?.token;

  const adminOk = await req('GET', '/api/admin/users', { token: adminToken });
  check('admin can list users', adminOk.status === 200 && Array.isArray(adminOk.data));
  check('user list hides password hashes', adminOk.data.every(u => !('password' in u) && !('passwordHash' in u)));

  if (!DIRTY) {
    const demoLearner = await req('POST', '/api/auth/switch-demo', { body: { targetRole: 'USER' } });
    check('demo learner seeded', demoLearner.status === 200 && demoLearner.data?.user?.email === 'learner@devops-os.local');
    const demoLs = await req('GET', '/api/learning-state', { token: demoLearner.data?.token });
    check('demo learner has seeded state', demoLs.data?.currentTaskId === 'task-0-1-1');
  }

  // ---------- Misc / errors ----------
  console.log('\nError handling');
  const unknownApi = await req('GET', '/api/does-not-exist');
  check('unknown API route -> 404 JSON', unknownApi.status === 404 && unknownApi.data?.error === 'API endpoint not found.', `got ${unknownApi.status}`);
  const roadmapNoAuth = await req('GET', '/api/roadmap');
  check('protected route without token -> 401', roadmapNoAuth.status === 401, `got ${roadmapNoAuth.status}`);

  // ---------- Summary ----------
  console.log(`\n========================================`);
  console.log(`Results: ${passed} passed, ${failed} failed (store mode: ${storeMode})`);
  if (failed > 0) {
    console.log('Failed checks:');
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
  console.log('ALL SMOKE TESTS PASSED');
}

main().catch(err => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});
