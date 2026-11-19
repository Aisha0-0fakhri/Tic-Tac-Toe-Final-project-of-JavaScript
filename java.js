(function () {
      var LINES = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];

      var names = {
         X: 'Player 1',
         O: 'Player 2'
        };
      var scores = {
         X: 0,
         O: 0, 
         D: 0 
        };

      var starter = 'X';
      var board, turn, over, popupTimer;

      var $ = function (id) { 
        return document.getElementById(id); 
      };
      var boardEl = $('board');
      var statusEl = $('status');
      var cells = [];

      /* ---------- Light / dark mode ---------- */
      var root = document.documentElement;
      var themeBtn = $('theme');

      function currentTheme() {
        if (root.dataset.theme) return root.dataset.theme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      function updateThemeButton() {
        themeBtn.textContent = currentTheme() === 'dark' ? 'Light mode' : 'Dark mode';
      }

      try {
        var saved = localStorage.getItem('ttt-theme');
        if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;
      } catch (err) {}

      themeBtn.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        root.dataset.theme = next;
        try { localStorage.setItem('ttt-theme', next); } catch (err) {}
        updateThemeButton();
      });
      updateThemeButton();

      /* ---------- Board ---------- */
      for (var i = 0; i < 9; i++) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'cell';
        b.dataset.i = i;
        b.addEventListener('click', onCell);
        boardEl.appendChild(b);
        cells.push(b);
      }

      function winnerOf() {
        for (var k = 0; k < LINES.length; k++) {
          var l = LINES[k];
          if (board[l[0]] && board[l[0]] === board[l[1]] && board[l[0]] === board[l[2]]) {
            return { p: board[l[0]], line: l };
          }
        }
        return null;
      }

      function render(winLine) {
        for (var i = 0; i < 9; i++) {
          var c = cells[i], v = board[i];
          c.className = 'cell' + (v ? ' ' + v.toLowerCase() : '') +
            (winLine && winLine.indexOf(i) > -1 ? ' win' : '');
          c.textContent = '';
          if (v) {
            var m = document.createElement('span');
            m.className = 'm';
            m.textContent = v;
            c.appendChild(m);
          }
          var r = Math.floor(i / 3) + 1, col = (i % 3) + 1;
          c.setAttribute('aria-label', 'Row ' + r + ', column ' + col + ', ' + (v || 'empty'));
          c.disabled = over || !!v;
        }
        $('sx').textContent = scores.X;
        $('so').textContent = scores.O;
        $('sd').textContent = scores.D;
        $('lx').textContent = names.X;
        $('lo').textContent = names.O;
      }

      /* ---------- Status line (top) ---------- */
      function showTurn(p) {
        statusEl.textContent = '';
        var s = document.createElement('span');
        s.className = 'mk ' + p.toLowerCase();
        s.textContent = names[p];
        statusEl.appendChild(s);
        statusEl.appendChild(document.createTextNode("'s turn (" + p + ')'));
      }

      /* ---------- Pop-up ---------- */
      function openModal(winner) {
        var title = $('modalTitle');
        title.className = winner ? winner.toLowerCase() : '';
        title.textContent = winner ? names[winner] + ' wins!' : "It's a draw!";
        $('modalText').textContent =
          names.X + ' ' + scores.X + '  \u00b7  Draws ' + scores.D + '  \u00b7  ' + names.O + ' ' + scores.O;
        $('overlay').hidden = false;
        $('again').focus();
      }

      function closeModal() {
        clearTimeout(popupTimer);
        $('overlay').hidden = true;
      }

      /* ---------- Game flow ---------- */
      function onCell(e) {
        var i = +e.currentTarget.dataset.i;
        if (over || board[i]) return;

        board[i] = turn;

        var w = winnerOf();
        if (w) {
          over = true;
          scores[w.p]++;
          statusEl.textContent = names[w.p] + ' wins!';
          render(w.line);
          popupTimer = setTimeout(function () { openModal(w.p); }, 600);
          return;
        }

        if (board.every(Boolean)) {
          over = true;
          scores.D++;
          statusEl.textContent = "It's a draw";
          render();
          popupTimer = setTimeout(function () { openModal(null); }, 400);
          return;
        }

        turn = turn === 'X' ? 'O' : 'X';
        showTurn(turn);
        render();
      }

      function newRound(flip) {
        closeModal();
        if (flip) starter = starter === 'X' ? 'O' : 'X';
        board = Array(9).fill(null);
        turn = starter;
        over = false;
        showTurn(turn);
        render();
      }

      /* ---------- Name entry ---------- */
      $('setup').addEventListener('submit', function (e) {
        e.preventDefault();
        names.X = $('nameX').value.trim() || 'Player 1';
        names.O = $('nameO').value.trim() || 'Player 2';
        scores = { X: 0, O: 0, D: 0 };
        starter = 'X';
        $('setup').hidden = true;
        $('game').hidden = false;
        newRound(false);
      });

      $('change').addEventListener('click', function () {
        closeModal();
        $('nameX').value = names.X;
        $('nameO').value = names.O;
        $('game').hidden = true;
        $('setup').hidden = false;
        $('nameX').focus();
      });

      /* ---------- Buttons ---------- */
      $('next').addEventListener('click', function () { newRound(true); });
      $('again').addEventListener('click', function () { newRound(true); });
      $('reset').addEventListener('click', function () {
        scores = { X: 0, O: 0, D: 0 };
        starter = 'X';
        newRound(false);
      });

      // Start on the name screen
      board = Array(9).fill(null);
      over = false;
      turn = 'X';
      render();
      $('nameX').focus();
    })();