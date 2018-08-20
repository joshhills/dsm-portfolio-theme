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
    var _cUrl       = '/competencies';
    var _markTable  = false; 

    // UI elements
    var _blocks     = [];
    var _tabs       = [];
    var _next       = {};
    var _previous   = {};
    var _table      = undefined;

    /**
     * Initialize mini-library
     * (bootstrap variables).
     * 
     * @returns Exposed functions for UI to call
     */
    function initialize() {
        // Presume access to page variables.
        _vignettes = window['vignette_vignettes'];
        _targets   = window['vignette_targets'];
        _cUrl      = window['vignette_c_url'];
        _markTable = window['vignette_mark_table'];

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
            combine: _combine,
            updateVignette: _updateVignette,
            nextVignette: _nextVignette,
            previousVignette: _previousVignette,
            sort: _sortCurrentVignette
        };
    }

    /**
     * Retrieve DOM elements
     * for manipulation.
     */
    function registerUI() {
        // Get omnipresent pagination components.
        _previous = document.getElementById('tab-previous');
        _next = document.getElementById('tab-next');

        // Get all dynamic elements.
        for(var i = 0; i < _vignettes.length; i++) {
            // Get tab and content block elements.
            _blocks.push(document.getElementById('block-' + i.toString()));
            _tabs.push(document.getElementById('tab-' + i.toString()));
        }

        // Get table.
        _table = document.getElementById('table');
    }

    // Define UI manipulation functions.

    /**
     *
     *
     * @param {*} index
     * @returns
     */
    function _updateVignette(index, override = false) {
        // Redundancy check.
        if(_index === index && !override) {
            return;
        }

        let activeClass = 'active';

        // Update previous tab element.
        _tabs[_index].classList.remove(activeClass);

        // Update previous block element.
        _blocks[_index].classList.remove(activeClass);

        if(index === 0) {
            _previous.classList.add('disabled');
        } else {
            _previous.classList.remove('disabled');
        }

        if(index === _vignettes.length - 1) {
            _next.classList.add('disabled');
        } else {
            _next.classList.remove('disabled');
        }
        
        // Update data model.
        _index = index;

        // Update tab element.
        _tabs[_index].classList.add(activeClass);

        // Update block element.
        _blocks[_index].classList.add(activeClass);

        // Update competency table.
        _updateTable(index);
    }

    function _nextVignette() {
        if(_index != _vignettes.length - 1) {
            _updateVignette(_index + 1);
        }
    }

    function _previousVignette() {
        if(_index != 0) {
            _updateVignette(_index - 1);
        }
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

    function _sortTable() {
        // Perform sort on current table using key (column).
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

    function _sortCurrentVignette(sortKey, ascending) {
        // Sort the table.
        for(var i = 0; i < _vignettes.length; i++) {
            // Recompute table data ahead of time.
            _tableData[i] = _tableify(i, sortKey, ascending);
        }

        // Update table HTML.
        _updateVignette(_index, true);
    }

    function _tableify(index, sortKey = 'competencyId', ascending = true) {
        // Build HTML for all unique skills...
        var tableRowsData = [];
        var tableRowsHTML = [];
        
        for(let competency of _all) {
            // Build table row data.
            var tableRowData = {
                competencyId: competency,
                linked: (linked => {
                    for(let v of _vignettes) {
                        for(let c of v['competencies']) {
                            if(c['id'] === competency) {
                                return c['linked'];
                            }
                        }
                    }
                    return false;
                })(),
                target: _targets.indexOf(competency) != -1,
                count: (total => {
                    for(let c of _vignettes[index]['competencies']) {
                        if(c['id'] === competency) {
                            return c['count'];
                        }
                    }
                    return 0;
                })(),
                removed: Math.abs(_indexDiffWithType(competency, index, 'removed')),
                unchanged: _indexDiffWithType(competency, index, 'unchanged'),
                added: _indexDiffWithType(competency, index, 'added')
            };
            tableRowsData.push(tableRowData);
        }

        // Sort rows by Id (default).
        tableRowsData.sort(function(a, b){
            var nameA = a[sortKey], nameB = b[sortKey];
            if(nameA < nameB) {
                if(ascending) {
                    return -1;
                }
                else {
                    return 1;
                }
            }
            if(nameA > nameB) {
                if(ascending) {
                    return 1;
                } else {
                    return -1;
                }
            }
            return 0;
        });

        for(let tableRowData of tableRowsData) {
            // Convert table row data into HTML.
            tableRowsHTML.push(_tableRowDataToHTML(tableRowData));
        }

        // Create new table.
        var headerRow = '<tr id="table-header"><th>Competency ';
        if(sortKey === 'competencyId') {
            if(ascending) {
                headerRow += '<i class="fas fa-sort-down" onclick="javascript:$vignette.sort(\'competencyId\', false)"></i>';
            } else {
                headerRow += '<i class="fas fa-sort-up" onclick="javascript:$vignette.sort(\'competencyId\', true)"></i>'
            }
        } else {
            headerRow += '<i class="fas fa-sort" onclick="javascript:$vignette.sort(\'competencyId\', false)"></i>';
        }
        headerRow += '</th>';

        if(_targets) {
            headerRow += '<th>Target ';
            if(sortKey === 'target') {
                if(ascending) {
                    headerRow += '<i class="fas fa-sort-down" onclick="javascript:$vignette.sort(\'target\', false)"></i>';
                } else {
                    headerRow += '<i class="fas fa-sort-up" onclick="javascript:$vignette.sort(\'target\', true)"></i>'
                }
            } else {
                headerRow += '<i class="fas fa-sort" onclick="javascript:$vignette.sort(\'target\', false)"></i>';
            }
            headerRow += '</th>';
        }

        headerRow +=      '<th>Count ';
        if(sortKey === 'count') {
            if(ascending) {
                headerRow += '<i class="fas fa-sort-down" onclick="javascript:$vignette.sort(\'count\', false)"></i>';
            } else {
                headerRow += '<i class="fas fa-sort-up" onclick="javascript:$vignette.sort(\'count\', true)"></i>'
            }
        } else {
            headerRow += '<i class="fas fa-sort" onclick="javascript:$vignette.sort(\'count\', false)"></i>';
        }
        headerRow += '</th>';

        headerRow += '<th>Removed ';
        if(sortKey === 'removed') {
            if(ascending) {
                headerRow += '<i class="fas fa-sort-down" onclick="javascript:$vignette.sort(\'removed\', false)"></i>';
            } else {
                headerRow += '<i class="fas fa-sort-up" onclick="javascript:$vignette.sort(\'removed\', true)"></i>'
            }
        } else {
            headerRow += '<i class="fas fa-sort" onclick="javascript:$vignette.sort(\'removed\', false)"></i>';
        }
        headerRow += '</th>';
        
        headerRow += '<th>Unchanged ';
        if(sortKey === 'unchanged') {
            if(ascending) {
                headerRow += '<i class="fas fa-sort-down" onclick="javascript:$vignette.sort(\'unchanged\', false)"></i>';
            } else {
                headerRow += '<i class="fas fa-sort-up" onclick="javascript:$vignette.sort(\'unchanged\', true)"></i>'
            }
        } else {
            headerRow += '<i class="fas fa-sort" onclick="javascript:$vignette.sort(\'unchanged\', false)"></i>';
        }
        headerRow += '</th>';
        
        headerRow += '<th>Added ';
        if(sortKey === 'added') {
            if(ascending) {
                headerRow += '<i class="fas fa-sort-down" onclick="javascript:$vignette.sort(\'added\', false)"></i>';
            } else {
                headerRow += '<i class="fas fa-sort-up" onclick="javascript:$vignette.sort(\'added\', true)"></i>'
            }
        } else {
            headerRow += '<i class="fas fa-sort" onclick="javascript:$vignette.sort(\'added\', false)"></i>';
        }
        headerRow += '</th></tr>';

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
        var encoded =   '<tr';

        if(_markTable && tableRowData.target && tableRowData.count > 0) {
            encoded += ' class="table-success"';
        }
        
        encoded += '><td>';
        if(tableRowData['linked']) {
            encoded += '<a href="' +
                        _cUrl +
                        '#' +
                        tableRowData['competencyId'] +
                        '">' +
                        tableRowData['competencyId'] +
                        '</a></td><td>';
        } else {
            encoded += '<span>' +
                        tableRowData['competencyId'] +
                        '</span></td><td>';
        }
        if(_targets) {
            if(tableRowData['target']) {
                encoded += 'Yes';
            } else {
                encoded += 'No';
            }
            encoded += '</td><td>';
        }
        encoded +=  tableRowData['count'] +
                    '</td><td';
        if(_markTable && tableRowData['removed'] < 0) {
            encoded += ' class="table-danger"';
        }
        encoded +=  '>' +
                    tableRowData['removed'] +
                    '</td><td>' +
                    tableRowData['unchanged'] +
                    '</td><td';
        if(_markTable && tableRowData['added'] > 0) {
            encoded += ' class="table-success"';
        }
        encoded +=  '>' +
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