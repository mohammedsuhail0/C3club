import json
import os

with open('graphify-out/graph.json', 'r', encoding='utf-8') as f:
    graph_data = json.load(f)

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>C3 Codebase · 3D Cyberpunk Galaxy (Graphify)</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background: #030712;
      color: #E2E8F0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      overflow: hidden;
    }}
    #3d-graph {{
      width: 100vw;
      height: 100vh;
    }}
    .hud {{
      position: absolute;
      top: 20px;
      left: 20px;
      z-index: 10;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(204, 90, 54, 0.4);
      border-radius: 16px;
      padding: 16px 20px;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
      max-width: 320px;
    }}
    .hud h1 {{
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #CC5A36;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .hud .subtitle {{
      font-size: 11px;
      color: #94A3B8;
      margin-bottom: 12px;
      font-family: monospace;
    }}
    .stats {{
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      margin-bottom: 14px;
      padding: 8px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      text-align: center;
    }}
    .stats .num {{
      font-size: 14px;
      font-weight: bold;
      color: #F8FAFC;
      font-family: monospace;
    }}
    .stats .label {{
      font-size: 9px;
      color: #64748B;
      text-transform: uppercase;
    }}
    .search-box {{
      width: 100%;
      box-sizing: border-box;
      padding: 8px 12px;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid #334155;
      color: #F8FAFC;
      font-family: monospace;
      font-size: 11px;
      outline: none;
      transition: all 0.2s;
    }}
    .search-box:focus {{
      border-color: #CC5A36;
      box-shadow: 0 0 10px rgba(204, 90, 54, 0.3);
    }}
    .controls {{
      display: flex;
      gap: 6px;
      margin-top: 10px;
    }}
    .btn {{
      flex: 1;
      padding: 6px 10px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #E2E8F0;
      font-size: 10px;
      font-family: monospace;
      cursor: pointer;
      transition: all 0.2s;
    }}
    .btn:hover {{
      background: #CC5A36;
      border-color: #CC5A36;
      color: #fff;
    }}
    .node-detail {{
      position: absolute;
      bottom: 20px;
      right: 20px;
      z-index: 10;
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 16px;
      max-width: 320px;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
      display: none;
    }}
    .node-detail h3 {{
      margin: 0 0 6px 0;
      font-size: 14px;
      color: #38BDF8;
      font-family: monospace;
      word-break: break-all;
    }}
    .node-detail .meta {{
      font-size: 11px;
      color: #94A3B8;
      line-height: 1.5;
      font-family: monospace;
    }}
  </style>
  <script src="https://unpkg.com/3d-force-graph"></script>
</head>
<body>
  <div id="3d-graph"></div>

  <div class="hud">
    <h1>
      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#CC5A36;box-shadow:0 0 8px #CC5A36;"></span>
      C3 Codebase Galaxy
    </h1>
    <div class="subtitle">Interactive 3D WebGL AST Graph</div>
    
    <div class="stats">
      <div>
        <div class="num">{len(graph_data['nodes'])}</div>
        <div class="label">Nodes</div>
      </div>
      <div>
        <div class="num">{len(graph_data['links'])}</div>
        <div class="label">Edges</div>
      </div>
      <div>
        <div class="num">32</div>
        <div class="label">Clusters</div>
      </div>
    </div>

    <input type="text" id="search" class="search-box" placeholder="🔍 Search component, api, hook..." />

    <div class="controls">
      <button class="btn" id="btn-rotate">Auto Orbit: ON</button>
      <button class="btn" id="btn-reset">Reset View</button>
    </div>
  </div>

  <div class="node-detail" id="inspector">
    <h3 id="node-title">Component</h3>
    <div class="meta" id="node-meta">File: src/App.tsx</div>
  </div>

  <script>
    const data = {json.dumps(graph_data)};

    const COLORS = [
      '#FF4D4D', '#FF9F43', '#FECA57', '#1DD1A1', '#48DBFB', 
      '#00D2D3', '#54A0FF', '#5F27CD', '#FF6B6B', '#C8D6E5',
      '#FF9FF3', '#F368E0', '#00D2D3', '#10AC84', '#EE5253'
    ];

    const degree = {{}};
    data.links.forEach(l => {{
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      degree[s] = (degree[s] || 0) + 1;
      degree[t] = (degree[t] || 0) + 1;
    }});

    data.nodes.forEach(n => {{
      const d = degree[n.id] || 1;
      n.val = Math.max(2.5, Math.min(24, d * 1.8));
      n.color = COLORS[(n.community || 0) % COLORS.length];
    }});

    const Graph = ForceGraph3D()
      (document.getElementById('3d-graph'))
      .graphData(data)
      .backgroundColor('#030712')
      .nodeId('id')
      .nodeLabel(n => `${{n.label || n.id}} (${{n.source_file || 'unknown'}})`)
      .nodeColor(n => n.color)
      .nodeVal('val')
      .nodeResolution(20)
      .linkOpacity(0.3)
      .linkColor(() => '#38BDF8')
      .linkDirectionalParticles(2)
      .linkDirectionalParticleWidth(1.5)
      .linkDirectionalParticleSpeed(0.005)
      .linkDirectionalParticleColor(() => '#CC5A36')
      .onNodeClick(node => {{
        const distance = 45;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
        Graph.cameraPosition(
          {{ x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }},
          node,
          2000
        );

        const inspector = document.getElementById('inspector');
        const title = document.getElementById('node-title');
        const meta = document.getElementById('node-meta');
        inspector.style.display = 'block';
        title.textContent = node.label || node.id;
        meta.innerHTML = `
          <strong>File:</strong> ${{node.source_file || 'N/A'}}<br>
          <strong>Location:</strong> ${{node.source_location || 'N/A'}}<br>
          <strong>Community:</strong> ${{node.community_name || node.community || 'N/A'}}<br>
          <strong>Connections:</strong> ${{degree[node.id] || 1}}
        `;
      }});

    let isOrbiting = true;
    let angle = 0;
    const distance = 450;
    setInterval(() => {{
      if (isOrbiting) {{
        angle += Math.PI / 1200;
        Graph.cameraPosition({{
          x: distance * Math.sin(angle),
          z: distance * Math.cos(angle)
        }});
      }}
    }}, 16);

    const rotateBtn = document.getElementById('btn-rotate');
    rotateBtn.addEventListener('click', () => {{
      isOrbiting = !isOrbiting;
      rotateBtn.textContent = isOrbiting ? 'Auto Orbit: ON' : 'Auto Orbit: OFF';
    }});

    document.getElementById('btn-reset').addEventListener('click', () => {{
      Graph.cameraPosition({{ x: 0, y: 0, z: 450 }}, {{ x: 0, y: 0, z: 0 }}, 1500);
      document.getElementById('inspector').style.display = 'none';
    }});

    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', (e) => {{
      const query = e.target.value.toLowerCase().trim();
      if (!query) return;
      const match = data.nodes.find(n => 
        (n.label && n.label.toLowerCase().includes(query)) ||
        (n.id && n.id.toLowerCase().includes(query)) ||
        (n.source_file && n.source_file.toLowerCase().includes(query))
      );
      if (match) {{
        isOrbiting = false;
        rotateBtn.textContent = 'Auto Orbit: OFF';
        const distance = 60;
        const distRatio = 1 + distance / Math.hypot(match.x, match.y, match.z);
        Graph.cameraPosition(
          {{ x: match.x * distRatio, y: match.y * distRatio, z: match.z * distRatio }},
          match,
          1500
        );
      }}
    }});
  </script>
</body>
</html>
"""

with open('graphify-out/graphify-3d.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Built 3D galaxy with embedded JSON!")
