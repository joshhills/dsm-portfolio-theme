/**
 * @
 */
$vignette = (function () {
    // Set up variables.

    // Data model
    var _all        = [];
    var _vignettes  = [];
    var _targets    = [];
    var _diffs      = [];
    var _targetsHit = [];
    var _index      = 0;
    var _tableData  = [];

    // UI elements
    var _blocks     = [];
    var _tabs       = [];
    var _table      = undefined;

    /**
     * Initialize mini-library
     * (bootstrap variables).
     * 
     * @returns Exposed functions for UI to call
     */
    function initialize() {
        // Presume access to page variables.
        _vignettes = window['vignettes'];
        _targets   = window['targets'];

        // Defensive checking.
        if(!_vignettes) {
            throw "Necessary data not found in page";
            return;
        }

        // Compute all competencies.
        _all = _combine();

        for(var i = 0; i < _vignettes.length; i++) {
            // Compute differences between vignettes ahead of time.
            _diffs[i] = _diff(_vignettes[i - 1], _vignettes[i]);
            // Compute targets hit per vignette ahead of time.
            _targetsHit[i] = _target(_vignettes[i]);
            // Compute table data ahead of time.
            _tableData[i] = _tableify(i);
        }
        
        // Access DOM elements.
        registerUI();

        // Set table data.
        _updateTable(0);

        // Move to latest view.
        _updateVignette(_vignettes.length - 1);

        // Expose functions.
        return {
            dump: _dump,
            updateVignette: _updateVignette,
            combine: _combine
        };
    }

    /**
     * Retrieve DOM elements
     * for manipulation.
     */
    function registerUI() {
        for(var i = 0; i < vignettes.length; i++) {
            // Get tab and content block elements.
            _blocks.push(document.getElementById('block-' + i.toString()));
            _tabs.push(document.getElementById('tab-' + i.toString()));
        }

        _table = document.getElementById('table');
    }

    // Define UI manipulation functions.

    /**
     *
     *
     * @param {*} index
     * @returns
     */
    function _updateVignette(index) {
        // Redundancy check.
        if(_index === index) {
            return;
        }

        // Update previous tab element.
        _tabs[_index].classList.remove('o-vignette-tabs__tab--active');

        // Update previous block element.
        _blocks[_index].classList.remove('o-vignette-blocks__block--active');
        
        // Update data model.
        _index = index;

        // Update tab element.
        _tabs[_index].classList.add('o-vignette-tabs__tab--active');

        // Update block element.
        _blocks[_index].classList.add('o-vignette-blocks__block--active');

        // Update competency table.
        _updateTable(index);
    }
    
    /**
     * Update the skill table based
     * on the current vignette.
     *
     * @param {*} index The index of the current vignette.
     */
    function _updateTable(index) {    
        // Remove previous rows (if any).
        _clearTable(_table);

        _table.innerHTML = _tableData[index];
    }

    // Define utility functions.

    /**
     * Output all notable variables.
     *
     * @returns An object containing variable contents
     */
    function _dump(index) {
        if(index) {
            return {
                vignette:   _vignettes[index],
                targets:    _targets,
                diff:       _diffs[index],
                targetsHit: _targetsHit[index]
            };
        } else {
            return {
                vignettes:  _vignettes,
                targets:    _targets,
                diffs:      _diffs,
                targetsHit: _targetsHit
            };
        }
    }

    function _tableify(index) {
        // Build HTML for all unique skills...
        var tableRowsHTML = [];
        
        for(let competency of _all) {
            // Build table row data.
            var tableRowData = {
                competencyId: competency,
                target: _targets.indexOf(competency) != -1,
                count: (total => {
                    for(let c of _vignettes[index]['competencies']) {
                        if(c['id'] === competency) {
                            return c['count'];
                        }
                    }
                    return 0;
                })(),
                removed: _indexDiffWithType(competency, index, 'removed'),
                unchanged: _indexDiffWithType(competency, index, 'unchanged'),
                added: _indexDiffWithType(competency, index, 'added')
            };
            // Convert table row data into HTML.
            tableRowsHTML.push(_tableRowDataToHTML(tableRowData));
        }

        // Create new table.
        var headerRow = '<tr id="table-header"><th>Competency</th>';
        if(_targets) {
            headerRow +=  '<th>Target</th>'
        }
        headerRow +=      '<th>Count</th><th>Removed</th><th>Unchanged</th><th>Added</th></tr>';

        var finalHTML = headerRow;
        for(let row of tableRowsHTML) {
            finalHTML += row;
        }

        return finalHTML;
    }

    /**
     * Shortcut method to get count of a competency
     * within a category of change (if existent).
     *
     * @param {*} competency The competency Id
     * @param {*} index      The vignette iteration
     * @param {*} type       The type of change
     * @returns              The total occurences
     */
    function _indexDiffWithType(competency, index, type) {
        for(let c of _diffs[index][type]) {
            if(c['id'] === competency) {
                return c['countChange'];
            }
        }
        return 0;
    }

    /**
     * Convert table row data to raw HTML.
     *
     * @param {*} tableRowData HTML to inject.
     */
    function _tableRowDataToHTML(tableRowData) {
        var encoded =   '<tr><td><span class="a-pill">' +
                        tableRowData['competencyId'] +
                        '</span></td><td>';
        if(_targets) {
            if(tableRowData['target']) {
                encoded += 'Yes';
            } else {
                encoded += 'No';
            }
            encoded += '</td><td>';
        }
        encoded +=  tableRowData['count'] +
                    '</td><td>' +
                    tableRowData['removed'] +
                    '</td><td>' +
                    tableRowData['unchanged'] +
                    '</td><td>' +
                    tableRowData['added'] +
                    '</td></tr>';
        return encoded;
    }

    /**
     * Remove contents of table.
     *
     * @param {*} table The table DOM element
     */
    function _clearTable(table) {
        table.innerHTML = '';
    }

    /**
     * Return an array of all competencies
     * mentioned in any vignette or targets.
     * 
     * @returns Array of unique competency Ids
     */
    function _combine() {
        allCompetencies = []
        
        // Add all from vignettes.
        for(let vignette of _vignettes) {
            for(let competency of vignette['competencies']) {
                allCompetencies.push(competency['id']);
            }
        }

        // Add all from targets.
        allCompetencies = allCompetencies.concat(_targets);

        // De-duplicate.
        return _uniqueBy(allCompetencies, k => k);
    }

    /**
     * Compare differences in competencies reported in vignettes.
     *
     * @param {*} v1 Previous vignette
     * @param {*} v2 New vignette
     * @returns      An object containing change information
     */
    function _diff(v1, v2) {
        // Hoist output declarations.
        var differences = [], removed = [], unchanged = [], added = [];

        // If it is the first vignette...
        if(!v1) {
            // All competencies are added, so get a list of them.
            for(let competency of v2['competencies']) {
                var c = { 'id': competency['id'], 'countChange': competency['count'] };
                differences.push(c);
                added.push(c);
            }
        } else {
            // Create an index of all competencies in both vignettes.
            differences = _uniqueBy(
                v1['competencies'].concat(v2['competencies']),
                k => k['id']
            ).map(c => {
                return { 'id': c['id'], 'countChange': 0 };
            });

            // For every competency, check its state before and after.
            for(let competency of differences) {
                // Find out how many were in the both vignettes.
                var numInV1 = 0, numInV2 = 0;

                for(let c1 of v1['competencies']) {
                    if(c1['id'] === competency['id']) {
                        numInV1 = c1['count'];
                        break;
                    }
                }

                for(let c2 of v2['competencies']) {
                    if(c2['id'] === competency['id']) {
                        numInV2 = c2['count'];
                        break;
                    }
                }
                
                // Compute the change.
                competency['countChange'] = numInV2 - numInV1;
            }

            // Perform extra formatting for view.
            for(let competency of differences) {
                if(competency['countChange'] < 0) {
                    removed.push(competency);
                } else if(competency['countChange'] > 0) {
                    added.push(competency);
                } else {
                    unchanged.push(competency);
                }
            }
        }

        return {
            differences: differences,
            removed: removed,
            unchanged: unchanged,
            added: added
        };
    }

    /**
     * Find which target Ids have been
     * included in a vignette.
     *
     * @param {*} vignette  The vignette to check
     * @returns             Targets that have been hit
     */
    function _target(vignette) {
        // Defensive sanity check.
        if(!_targets) {
            console.log('No targets defined for this project.');
            return;
        }

        targetsHit = [];

        // For every target Id...
        for(let target of _targets) {
            // Construct the outcome.
            var outcome = {
                'id': target,
                'hit': false
            };

            // Search for it in the vignette.
            for(let competency of vignette['competencies']) {
                outcome['hit'] |= target === competency['id'];
                if(outcome['hit']) {
                    break;
                }
            }

            targetsHit.push(outcome);
        }

        return targetsHit;
    }

    /**
     * De-duplicate an array by an object property.
     *
     * @param {*} a     Array
     * @param {*} key   Callback returning object property
     * @returns         De-duplicated array
     */
    function _uniqueBy(a, key) {
        var seen = {};
        return a.filter(function(item) {
            var k = key(item);
            return seen.hasOwnProperty(k) ? false : (seen[k] = true);
        })
    }

    return initialize();
})();