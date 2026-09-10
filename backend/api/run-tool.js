const toolMap = {
  dialogue: {
    label: 'dialogue',
    title: 'Dialogue Generator',
    output: (prompt) => `Dialogue Generator Output\n\nPrompt: ${prompt}\n\nGenerated concept:\nA quiet conversation begins in the old market district. The speaker chooses a careful tone, references the village archive, and reveals a secret that shifts the player toward a new objective.\n\nSuggested next move:\nWrite a short exchange with three beats: tension, discovery, and a reason to investigate further.`
  },
  quest: {
    label: 'quest',
    title: 'Quest Designer',
    output: (prompt) => `Quest Designer Output\n\nPrompt: ${prompt}\n\nGenerated quest concept:\nThe player is asked to recover an ember-marked relic before the river gates close. The quest begins with a community request, moves through a dangerous route, and resolves with an oath-bound reward.\n\nQuest structure:\n1. Meet the keeper.\n2. Track the relic trail.\n3. Resolve the river crossing.\n4. Return the relic and choose a consequence.`
  },
  item: {
    label: 'item',
    title: 'Item Architect',
    output: (prompt) => `Item Architect Output\n\nPrompt: ${prompt}\n\nGenerated item concept:\nLantern-Moth Relic\nType: Consumable relic\nRarity: Uncommon\nLore: It hums when a hidden route is near.\nRole: Reveals sealed passage trails and grants a small burst of clarity during exploration.\n\nDesign note:\nKeep the item useful without becoming a replacement for active combat choices.`
  },
  patchnotes: {
    label: 'patchnotes',
    title: 'Patch Note Composer',
    output: (prompt) => `Patch Note Composer Output\n\nPrompt: ${prompt}\n\nRelease note draft:\nVersion 1.4.1\n\nThis update improves world continuity, clarifies quest flow, and smooths the player experience across newly added locations.\n\nNew systems:\n- Added improved route guidance\n- Expanded companion reactions\n- Improved item discovery markers\n\nKnown objectives:\nContinue monitoring balancing reports and refine quest pacing based on player feedback.`
  },
  balance: {
    label: 'balance',
    title: 'Balance Evaluator',
    output: (prompt) => `Balance Evaluator Output\n\nPrompt: ${prompt}\n\nGenerated balancing observation:\nThe current encounter structure favors consistency in reward pacing but may overvalue low-risk scouting. Consider adjusting encounter pressure, resource yield, and time-to-reward ratios.\n\nRecommendation:\nIntroduce a moderate combat reward increase for high-risk areas and reduce repeat utility from passive exploration loops.`
  },
  script: {
    label: 'script',
    title: 'Script Generator',
    output: (prompt) => `Script Generator Output\n\nPrompt: ${prompt}\n\nGenerated script structure:\nBegin at the old gate. Trigger ambient sound, reveal the warded sigil, and introduce a branch that changes the next location.\n\nSequence:\n1. Play opening alert.\n2. Wait for player input.\n3. Reveal hidden route.\n4. Mark active objective.\n5. Continue scene with conditional narration.`
  }
};

function safeToolName(tool) {
  if (!tool) return '';
  return String(tool).toLowerCase().trim();
}

function buildResponse(tool, prompt) {
  const key = safeToolName(tool);
  const definition = toolMap[key];

  if (!definition) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: `Unknown tool: ${tool}. Available tools: ${Object.keys(toolMap).join(', ')}`
      })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      tool: definition.label,
      title: definition.title,
      output: definition.output(prompt || '')
    })
  };
}

module.exports = async function runTool(input = {}, response = null) {
  const method = input.httpMethod || input.method || 'POST';
  const headers = input.headers || {};

  if (method.toUpperCase() !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  let payload = {};

  if (typeof input.body === 'string') {
    try {
      payload = JSON.parse(input.body);
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid JSON payload.' })
      };
    }
  } else if (typeof input.body === 'object' && input.body) {
    payload = input.body;
  } else if (input.tool || input.prompt) {
    payload = input;
  }

  const tool = safeToolName(payload.tool);
  const prompt = typeof payload.prompt === 'string' ? payload.prompt : '';

  if (!tool) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Tool is required.' })
    };
  }

  if (!prompt.trim()) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Prompt is required.' })
    };
  }

  return buildResponse(tool, prompt);
};
