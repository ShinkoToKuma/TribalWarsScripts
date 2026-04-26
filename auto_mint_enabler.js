(function () {
    if (window.location.href.indexOf('&screen=overview_villages&mode=buildings') < 0) {
        window.location.assign(game_data.link_base_pure + "overview_villages&mode=buildings");
        return;
    }

    const csrf = csrf_token;
    let mode = 'start'; // 'start' or 'cancel'

    const villages = $('#villages tr').map(function () {
        const row = $(this);
        const snob = row.find('td.b_snob').text().trim();

        if (snob === "1") {
            const id = row.attr('id').replace('v_', '');
            const name = row.find('.quickedit-label').text().trim();

            return { id, name };
        }
    }).get();

    let html = `
        <div style="margin-bottom:10px;">
            <button id="toggle-mode" class="btn">Switch to Cancel Mode</button>
        </div>

        <table class="vis">
            <thead>
                <tr>
                    <th>Village</th>
                    <th>Action</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    villages.forEach(v => {
        html += `
            <tr data-id="${v.id}">
                <td>${v.name}</td>
                <td>
                    <button class="start-btn btn" data-id="${v.id}">
                        Enable auto mint
                    </button>
                </td>
                <td class="status">-</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;

    Dialog.show('Auto Minting UI', html);

    let locked = false;

    $(document).on('click', '#toggle-mode', function () {
        mode = (mode === 'start') ? 'cancel' : 'start';
        const isStart = mode === 'start';
        $(this).text(isStart ? 'Switch to Cancel Mode' : 'Switch to Enable Mode');
        $('.start-btn')
            .text(isStart ? 'Enable auto mint' : 'Cancel auto mint')
            .prop('disabled', false);

        $('.status').text('-');
        locked = false;
        $('.start-btn:first').focus();
    });

    $(document).on('click', '.start-btn', function () {
        if (locked) return;

        locked = true;

        const btn = $(this);
        const id = btn.data('id');
        const row = btn.closest('tr');
        const statusCell = row.find('.status');

        const action = (mode === 'start')
            ? 'start_auto_minting_session'
            : 'cancel_auto_minting_session';

        btn.prop('disabled', true);
        statusCell.text('Sending...');

        $.post(`/game.php?village=${id}&screen=snob&action=${action}`, {
            h: csrf
        })
            .done(function () {
                statusCell.text(mode === 'start' ? '✅ Activated' : '🛑 Cancelled');
            })
            .fail(function () {
                statusCell.text('❌ Failed');
                btn.prop('disabled', false);
            })
            .always(function () {
                setTimeout(() => {
                    locked = false;

                    const nextBtn = row.next().find('.start-btn:not(:disabled)');
                    if (nextBtn.length) {
                        nextBtn.focus();
                    }
                }, 200);
            });
    });

})();