// Main Data Storage
(function() {
    const base = (window.PhishyConfig && window.PhishyConfig.apiBase) || "/api";

    let currentUser = null;
    const readyPromise = (async () => {
        try {
            const res = await fetch(base + "/me", {
                credentials: "include"
            });
            if (res.ok) {
                const data = await res.json();
                currentUser = data.user || null;
            }
        } catch (_) {}
    })();

    // Request Helper
    const post = async (path, body) => {
        const res = await fetch(base + path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(body || {}),
            keepalive: true,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            const err = new Error(data.error || "request_failed");
            err.status = res.status;
            throw err;
        }
        return data;
    };


    // Auth that will handle logins, signups, logouts
    const auth = {
        getCurrentUser: () => currentUser,
        signIn: async (email, password) => {
            try {
                const u = await post("/login", {
                    email,
                    password
                });
                currentUser = u;
                return u;
            } catch (e) {
                if (e.status === 401) return null;
                throw e;
            }
        },
        signUp: async (email, password, name) => {
            const u = await post("/signup", {
                email,
                password,
                name
            });
            currentUser = u;
            return u;
        },
        signOut: async () => {
            await post("/logout", {});
            currentUser = null;
        },
    };


    // Analytics for tracking site data
    const analytics = {
        trackVisit: () => post("/visit", {}).catch(() => {}),
        startSimulation: (simulationId) => post("/sim/start", {
            simulationId
        }),
        recordAnswer: (runId, questionId, answer, isCorrect) =>
            post("/sim/answer", {
                runId,
                questionId,
                answer,
                isCorrect
            }).catch(() => {}),
        finishSimulation: (runId, score, total) =>
            post("/sim/finish", {
                runId,
                score,
                total
            }).catch(() => {}),
        publicStats: async () => {
            const res = await fetch(base + "/public-stats", {
                credentials: "include"
            });
            if (!res.ok) throw new Error("public_stats_failed");
            return res.json();
        },
    };

    // Admin data fetch
    const admin = {
        stats: async () => {
            const res = await fetch(base + "/admin/stats", {
                credentials: "include"
            });
            if (!res.ok) throw new Error("forbidden");
            return res.json();
        },
    };

    // User data fetch
    const me = {
        runs: async () => {
            const res = await fetch(base + "/my/runs", {
                credentials: "include"
            });
            if (!res.ok) throw new Error("not_authenticated");
            return res.json();
        },
        courses: async () => {
            const res = await fetch(base + "/my/courses", {
                credentials: "include"
            });
            if (!res.ok) throw new Error("not_authenticated");
            return res.json();
        },
        completeCourse: (slug, score, total) =>
            post("/courses/" + encodeURIComponent(slug) + "/complete", {
                score,
                total
            }),
    };

    // Company data fetch
    const company = {
        overview: async () => {
            const res = await fetch(base + "/company", {
                credentials: "include"
            });
            if (!res.ok) throw new Error("forbidden");
            return res.json();
        },
        addUser: (payload) => post("/company/users", payload),
        removeUser: async (id) => {
            const res = await fetch(base + "/company/users/" + encodeURIComponent(id), {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "remove_failed");
            }
            return res.json();
        },
    };

    window.Phishy = {
        ready: () => readyPromise,
        auth,
        analytics,
        admin,
        me,
        company,
    };

    readyPromise.then(() => analytics.trackVisit());
})();