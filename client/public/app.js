(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var dv = require('datavore');

console.log(dv);

},{"datavore":2}],2:[function(require,module,exports){
(function (global){
;__browserify_shim_require__=require;(function browserifyShim(module, exports, require, define, browserify_shim__define__module__export__) {
var dv = (function() {
/**
 * The top-level Datavore namespace. All public methods and fields should be
 * registered on this object. Note that core Datavore source is surrounded by an
 * anonymous function, so any other declared globals will not be visible outside
 * of core methods. This also allows multiple versions of Datavore to coexist,
 * since each version will see their own <tt>dv</tt> namespace.
 *
 * @namespace The top-level Datavore namespace, <tt>dv</tt>.
 */
var dv = {version: "1.0.0"};

dv.array = function(n) {
    var a = Array(n);
    for (var i = n; --i >= 0;) { a[i] = 0; }
    return a;
}

// -- RANDOM NUMBER GENERATORS ------------------------------------------------

dv.rand = {};

dv.rand.uniform = function(min, max) {
    min = min || 0;
    max = max || 1;
    var delta = max - min;
    return function() {
        return min + delta * Math.random();
    }
};

dv.rand.integer = function(a, b) {
    if (b === undefined) {
        b = a;
        a = 0;
    }
    return function() {
        return a + Math.max(0, Math.floor(b * (Math.random() - 0.001)));
    }
}

dv.rand.normal = function(mean, stdev) {
    mean = mean || 0;
    stdev = stdev || 1;
    var next = undefined;
    return function() {
        var x = 0, y = 0, rds, c;
        if (next !== undefined) {
            x = next;
            next = undefined;
            return x;
        }
        do {
            x = Math.random() * 2 - 1;
            y = Math.random() * 2 - 1;
            rds = x * x + y * y;
        } while (rds == 0 || rds > 1);
        c = Math.sqrt(-2 * Math.log(rds) / rds); // Box-Muller transform
        next = mean + y * c * stdev;
        return mean + x * c * stdev;
    }
}
// -- DATA TABLE --------------------------------------------------------------

dv.type = {
    nominal: "nominal",
    ordinal: "ordinal",
    numeric: "numeric",
    unknown: "unknown"
};

dv.table = function(input)
{
    var table = []; // the data table
    
    table.addColumn = function(name, values, type, iscolumn) {
        type = type || dv.type.unknown;
        var compress = (type === dv.type.nominal || type === dv.type.ordinal);
        var vals = values;
        
        if (compress && !iscolumn) {
            vals = [];
            vals.lut = code(values);
            for (var i = 0, map=dict(vals.lut); i < values.length; ++i) {
                vals.push(map[values[i]]);
            }
            vals.get = function(idx) { return this.lut[this[idx]]; }
        } else if (!iscolumn) {
            vals.get = function(idx) { return this[idx]; }
        }
        vals.name = name;
        vals.index = table.length;
        vals.type = type;

        table.push(vals);
        table[name] = vals;
    };
    
    table.removeColumn = function(col) {
        col = table[col] || null;
        if (col != null) {
            delete table[col.name];
            table.splice(col.index, 1);
        }
        return col;
    };
    
    table.rows = function() { return table[0] ? table[0].length : 0; };

    table.cols = function() { return table.length; };

    table.get = function(col, row) { return table[col].get(row); }

    table.dense_query = function(q) {
        var tab = q.where ? table.where(q.where) : table;
        var dims = [], sz = [1], hasDims = q.dims;
        if (hasDims) {
            sz = [];
            for (i = 0; i < q.dims.length; ++i) {
                var dim = q.dims[i], type = typeof dim;
                if (type === "string" || type === "number") {
                    col = tab[dim];
                } else if (dim.array) {
                    col = dim.array(tab[dim.value]);
                }
                dims.push(col);
                sz.push(col.lut.length);
            }
        }
        
        var vals = q.vals,  // aggregate query operators
            C = sz.reduce(function(a,b) { return a * b; }, 1), // cube cardinality
            N = tab[0].length, p, col, v, name, expr,        // temp vars
            cnt, sum, ssq, min, max,            // aggregate values
            _cnt, _sum, _ssq, _min, _max,       // aggregate flags
            ctx = {}, emap = {}, exp = [], lut, // aggregate state vars
            i = 0, j = 0, k = 0, l = 0, idx = 0, len, slen = sz.length; // indices        

        // Identify Requested Aggregates
        var star = false;
        for (i = 0; i < vals.length; ++i) {
            var req = vals[i].init();
            for (expr in req) {
                if (expr == "*") {
                    req[expr].map(function(func) {
                        ctx[func] = dv.array(C);
                    });
                    star = true;
                } else {
                    idx = tab[expr].index;
                    name = tab[expr].name;
                    req[expr].map(function(func) {
                        ctx[func + "_" + name] = (ctx[func + "_" + idx] = dv.array(C));
                    });
                    if (!emap[idx]) {
                        emap[idx] = true;
                        exp.push(idx);
                    }
                }
            }
        }
        if (exp.length == 0 && star) { exp.push(-1) };

        // Compute Cube Index Coefficients
        for (i = 0, p = [1]; i < slen; ++i) {
            p.push(p[i] * sz[i]);
        }
        
        // Execute Query: Compute Aggregates
        for (j = 0, len = exp.length; j < len; ++j) {
            expr = exp[j];
            cnt = ctx["cnt"]; _cnt = (cnt && j==0);
            sum = ctx["sum_" + expr]; _sum = (sum !== undefined);
            ssq = ctx["ssq_" + expr]; _ssq = (ssq !== undefined);
            min = ctx["min_" + expr]; _min = (min !== undefined);
            max = ctx["max_" + expr]; _max = (max !== undefined);
            col = tab[expr];
outer:            
            for (i = 0; i < N; ++i) {
                for (idx = 0, k = 0; k < slen; ++k) {
                    // compute cube index
                    l = (hasDims ? dims[k][i] : 0);
                    if (l < 0) continue outer;
                    idx += p[k] * l;
                }
                if (col) { v = col[i]; }
                if (_cnt) { cnt[idx] += 1; }
                if (_sum) { sum[idx] += v; }
                if (_ssq) { ssq[idx] += v * v; }
                if (_min && v < min[idx]) { min[idx] = v; }
                if (_max && v > max[idx]) { max[idx] = v; }
            }
        }
        
        // Generate Results
        var result = [], stride = 1, s, val, code = q.code || false;
        for (i = 0; i < dims.length; ++i) {
            col = [];
            lut = dims[i].lut;
            s = sz[i];
            val = 0;
            for (j = 0, k = 0, c = -1; j < C; ++j, ++k) {
                if (k == stride) { k = 0; val = (val + 1) % s; }
                col[j] = code ? val : lut[val];
            }
            stride *= s;
            col.unique = lut.length;
            result.push(col);
        }
        vals.map(function(op) { result.push(op.done(ctx)); });
        return result;
    };

    table.query = table.dense_query;

    table.sparse_query = function(q) {
        var tab = q.where ? table.where(q.where) : table;
        var dims = [], sz = [1], hasDims = q.dims;
        if (hasDims) {
            sz = [];
            for (i=0; i<q.dims.length; ++i) {
                var dim = q.dims[i], type = typeof dim;
                if (type === "string" || type === "number") {
                    col = tab[dim];
                } else if (dim.array) {
                    col = dim.array(tab[dim.value]);
                }
                dims.push(col);
                sz.push(col.lut.length);
            }
        }

        var vals = q.vals,  // aggregate query operators
            C = sz.reduce(function(a,b) { return a*b; }, 1), // cube cardinality
            N = tab[0].length, p, col, v, name, expr,      // temp vars
            cnt, sum, ssq, min, max,            // aggregate values
            _cnt, _sum, _ssq, _min, _max,       // aggregate flags
            ctx = {}, emap = {}, exp = [], lut, // aggregate state vars
            i = 0, j = 0, k = 0, l = 0, idx = 0, len, slen = sz.length; // indices        

        // Identify Requested Aggregates
        var star = false;
        for (i = 0; i < vals.length; ++i) {
            var req = vals[i].init();
            for (expr in req) {
                if (expr == "*") {
                    req[expr].map(function(func) {
                        ctx[func] = {};
                    });
                    star = true;
                } else {
                    idx = tab[expr].index;
                    name = tab[expr].name;
                    req[expr].map(function(func) {
                        ctx[func + "_" + name] = (ctx[func + "_" + idx] = {});
                    });
                    if (!emap[idx]) {
                        emap[idx] = true;
                        exp.push(idx);
                    }
                }
            }
        }
        if (exp.length == 0 && star) { exp.push(-1) };

        // Compute Cube Index Coefficients
        for (i = 0, p=[1]; i < slen; ++i) {
            p.push(p[i] * sz[i]);
        }
        // Execute Query: Compute Aggregates
        for (j = 0, len = exp.length; j < len; ++j) {
            expr = exp[j];
            cnt = ctx["cnt"]; _cnt = (cnt && j==0);
            sum = ctx["sum_" + expr]; _sum = (sum !== undefined);
            ssq = ctx["ssq_" + expr]; _ssq = (ssq !== undefined);
            min = ctx["min_" + expr]; _min = (min !== undefined);
            max = ctx["max_" + expr]; _max = (max !== undefined);
            col = tab[expr];
outer:            
            for (i = 0; i < N; ++i) {
                for (idx = 0, k = 0; k < slen; ++k) {
                    // compute cube index
                    l = (hasDims ? dims[k][i] : 0);
                    if (l < 0) continue outer;
                    idx += p[k] * l;
                }
                if (col) { v = col[i]; }
                if (_cnt) {
                    if (cnt[idx] === undefined) { cnt[idx]=0; }
                    cnt[idx] += 1;
                }
                if (_sum) {
                    if (sum[idx] === undefined) { sum[idx]=0; }
                    sum[idx] += v;
                }
                if (_ssq) {
                    if (ssq[idx] === undefined) { ssq[idx]=0; }
                    ssq[idx] += v * v;
                }
                if (_min && (min[idx] === undefined || v < min[idx])) {
                    min[idx] = v;
                }
                if (_max && (max[idx] === undefined || v > max[idx])) {
                    max[idx] = v;
                }
            }
        }

        // Generate Results
        var rr = vals.map(function(op) { return op.done(ctx); });
        var keys = rr[0];
        if (rr.length > 1) {
            keys = {};
            rr.forEach(function(o) { for (var k in o) keys[k] = 1; });
        }
        var result = dims.map(function() { return []; });
        vals.forEach(function() { result.push([]); });
        len = dims.length;

        for (k in keys) {
            // map index i to dimensional indices
            var nn = C, uv, div;
            for (i = k, j = len; --j >= 0;) {
                uv = dims[j].lut.length;
                div = ~~(nn / uv);
                result[j].push(dims[j].lut[~~(i / div)]);
                i = i % div;
                nn = ~~(nn / uv);
            }
            for (j = 0; j < rr.length; ++j) {
                val = rr[j][k];
                result[len + j].push(val === undefined ? 0 : val);
            }
        }
        return result;
    };
    
    table.where = function(f) {
        var nrows = table.rows(),
            ncols = table.cols();
        
        // initialize result table
        var result = dv.table([]);
        for (var i = 0; i < ncols; ++i) {
            result.push([]);
            result[i].name = table[i].name;
            result[i].type = table[i].type;
            result[i].index = i;
            result[table[i].name] = result[i];
            if (table[i].lut) { result[i].lut = table[i].lut; }
        }
        
        // populate result table
        for (var row = 0, j = -1; row < nrows; ++row) {
            if (f(table, row)) {
                for (i = 0, ++j; i < ncols; ++i) {
                    result[i][j] = table[i][row];
                }
            }
        }
        return result;
    };
    
    /** @private */
    function code(a) {
        var c = [], d = {}, v;
        for (var i=0, len=a.length; i<len; ++i) {
            if (d[v = a[i]] === undefined) { d[v] = 1; c.push(v); }
        }
        return typeof(c[0]) !== "number" ? c.sort()
            : c.sort(function(a,b) { return a - b; });
    };
    
    /** @private */
    function dict(lut) {
        return lut.reduce(function(a,b,i) { a[b] = i; return a; }, {});
    };

    // populate data table
    if (input) {
        input.forEach(function(d) {
            table.addColumn(d.name, d.values, d.type);    
        });
    }
    return table;
};

// -- QUERY OPERATORS ---------------------------------------------------------

dv.noop = function() {};

// -- aggregation (value) operators ---

dv.count = function(expr) {
    var op = {};
    op.init = function() {
        return {"*":["cnt"]};
    }
    op.done = function(ctx) { return ctx["cnt"]; };
    op.value = expr;
    return op;
};

dv.min = function(expr) {
    var op = {};
    op.init = function() {
        var o = {}; o[expr] = ["min"]; return o;
    }
    op.done = function(ctx) { return ctx["min_" + expr]; };
    op.value = expr;
    return op;
};

dv.max = function(expr) {
    var op = {};
    op.init = function() {
        var o = {}; o[expr] = ["max"]; return o;
    }
    op.done = function(ctx) { return ctx["max_" + expr]; };
    op.value = expr;
    return op;
};

dv.sum = function(expr) {    
    var op = {};
    op.init = function() {
        var o = {}; o[expr] = ["sum"]; return o;
    }
    op.done = function(ctx) { return ctx["sum_" + expr]; };
    op.value = expr;
    return op;
};

dv.avg = function(expr) {    
    var op = {};
    op.init = function() {
        var o = {"*":["cnt"]}; o[expr] = ["sum"]; return o;
    };
    op.done = function(ctx) {
        var akey = "avg_" + expr, avg = ctx[akey];
        if (!avg) {
            var sum = ctx["sum_" + expr], cnt = ctx["cnt"];
             if (Object.prototype.toString.call(sum) === "[object Array]") {
                ctx[akey] = (avg = sum.map(function(v,i) { return v / cnt[i]; }));
            } else {
                ctx[akey] = (avg = {});
                for (var i in sum) { avg[i] = sum[i] / cnt[i]; }
            }
        }
        return avg;
    };
    op.value = expr;
    return op;
};

dv.variance = function(expr, sample) {
    var op = {}, adj = sample ? 1 : 0;
    op.init = function() {
        var o = {"*":["cnt"]}; o[expr] = ["sum","ssq"]; return o;
    };
    op.done = function(ctx) {
        var cnt = ctx["cnt"], sum = ctx["sum_" + expr], ssq = ctx["ssq_" + expr];
        var akey = "avg_" + expr, avg = ctx[akey];

        if (!avg) {
            if (Object.prototype.toString.call(sum) === "[object Array]") {
                ctx[akey] = (avg = sum.map(function(v,i) { return v / cnt[i]; }));
            } else {
                ctx[akey] = (avg = {});
                for (var i in sum) { avg[i] = sum[i] / cnt[i]; }
            }
        }
        if (Object.prototype.toString.call(ssq) === "[object Array]") {
            return ssq.map(function(v,i) {
                return v / cnt[i] - avg[i] * avg[i];
            });
        } else {
            var va = {};
            for (var i in ssq) { va[i] = ssq[i] / cnt[i] - avg[i] * avg[i]; }
            return va;
        }
    };
    op.value = expr;
    return op;
};

dv.stdev = function(expr, sample) {
    var op = dv.variance(expr, sample), end = op.done;
    op.done = function(ctx) {
        var dev = end(ctx);
        if (Object.prototype.toString.call(dev) === "[object Array]") {
            for (var i = 0; i < dev.length; ++i) { dev[i] = Math.sqrt(dev[i]); }
        } else {
            for (var i in dev) { dev[i] = Math.sqrt(dev[i]); }
        }
        return dev;
    }
    return op;
};

// -- dimension operators ---

dv.bin = function(expr, step, min, max) {
    var op = {};
    op.array = function(values) {
        var N = values.length, val, idx, i,
            minv = min, maxv = max, minb = false, maxb = false;
        if (minv === undefined) { minv = Infinity; minb = true; }
        if (maxv === undefined) { maxv = -Infinity; maxb = true; }
        if (minb || maxb) {
            for (i = 0; i < N; ++i) {
                val = values[i];
                if (minb && val < minv) { minv = val; }
                if (maxb && val > maxv) { maxv = val; }
            }
            if (minb) { minv = Math.floor(minv / step) * step; }
            if (maxb) { maxv = Math.ceil(maxv / step) * step; }
        }
        // compute index array
        var a = [], lut = (a.lut = []),
            range = (maxv - minv), unique = Math.ceil(range / step);
        for (i = 0; i < N; ++i) {
            val = values[i];
            if (val < minv || val > maxv) { a.push(-1); }
            else if (val == maxv) { a.push(unique - 1); }
            else { a.push(~~((values[i] - minv) / step)); }
        }
        for (i = 0; i < unique; ++i) {
            // multiply b/c adding garners round-off error
            lut.push(minv + i * step);
        }
        return a;
    };
    op.step = function(x) {
        if (x === undefined) return step;
        step = x;
        return op;
    };
    op.min = function(x) {
        if (x === undefined) return min;
        min = x;
        return op;
    };
    op.max = function(x) {
        if (x === undefined) return max;
        max = x;
        return op;
    };
    op.value = expr;
    return op;
};

dv.quantile = function(expr, n) {    
    function search(array, value) {
        var low = 0, high = array.length - 1;
        while (low <= high) {
            var mid = (low + high) >> 1, midValue = array[mid];
            if (midValue < value) { low = mid + 1; }
            else if (midValue > value) { high = mid - 1; }
            else { return mid; }
        }
        var i = -low - 1;
        return (i < 0) ? (-i - 1) : i;
    }

    var op = {};
    op.array = function(values) {
        // get sorted data values
        var i, d = values.sorted;
        if (!d) {
            var cmp;
            if (values.type && values.type === "numeric") {
                cmp = function(a,b) { return a - b; }
            } else {
                cmp = function(a,b) { return a < b ? -1 : a > b ? 1 : 0; }
            }
            values.sorted = (d = values.slice().sort(cmp));
        }
        // compute quantile boundaries
        var q = [d[0]], a = [], lut = (a.lut = []);
        for (i = 1; i <= n; ++i) {
            q[i] = d[~~(i * (d.length - 1) / n)];
            lut.push(i - 1);
        }
        // iterate through data and label quantiles
        for (i = 0; i < values.length; ++i) {
            a.push(Math.max(0, search(q, values[i]) - 1));
        }
        return a;
    }
    op.bins = function(x) {
        if (x === undefined) return n;
        n = x;
        return op;
    }
    op.value = expr;
    return op;
};

return dv; })();
; browserify_shim__define__module__export__(typeof dv != "undefined" ? dv : window.dv);

}).call(global, undefined, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])