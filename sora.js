(async function() {
    
    // Configuration
    const CONFIG = {
        numberOfVideos: 5, // Nombre total de vidéos à générer
        concurrentGenerations: 1, // Une seule génération à la fois pour respecter la limite
        delayBetweenBatches: 60000, // 60 secondes entre chaque génération
        delayBetweenClicks: 2000, // Délai entre chaque clic dans une même vague
        storageKey: 'videoGeneratorState',
        autoDownload: true,
        delayBeforeDownload: 3000,
        maxWaitTimeMs: 600000, // 10 minutes max pour chaque vidéo
        pollInterval: 3000, // Intervalle de vérification pour les nouvelles vidéos
        maxClickRetries: 10, // Nombre de tentatives pour le clic
        maxDownloadRetries: 3, // Nombre de tentatives pour le téléchargement
        retryClickDelay: 10000 // 10 secondes avant de retenter un clic
    };

    // Idées de jouets fantaisistes
    const TOY_IDEAS = [
        "un jouet qui permet aux enfants de communiquer avec les meubles de la maison",
        "un kit scientifique qui transforme les légumes en créatures vivantes",
        "des poupées qui vivent dans des maisons faites de fromage",
        "un jouet qui simule la vie d'adulte (payer des factures, embouteillages) présenté comme super fun",
        "un kit de survie en cas d'invasion extraterrestre pour enfants, ton joyeux et coloré",
        "un jouet où les enfants peuvent élever des monstres sous leur lit",
        "un jouet qui permet aux enfants de créer leur propre pays imaginaire avec ses lois bizarres",
        "des figurines d'action de légumes super-héros qui combattent la malbouffe",
        "un jeu de société où on doit devenir ami avec des fantômes",
        "un kit pour fabriquer ses propres nuages d'intérieur",
        "des robots de compagnie qui mangent les devoirs des enfants",
        "un télescope qui permet de voir dans les rêves des autres",
        "des chaussures magiques qui donnent des super-pouvoirs mais seulement le mardi",
        "un animal de compagnie virtuel qui vit dans le grille-pain",
        "un kit pour construire sa propre planète miniature dans sa chambre",
        "des lunettes qui permettent de voir les émotions des gens en couleurs",
        "un micro-ondes jouet qui fait voyager les objets dans le temps",
        "des figurines de microbes géants super mignons à collectionner",
        "un jeu de construction pour bâtir des villes sous-marines dans la baignoire",
        "un robot qui traduit le langage des animaux domestiques",
        "des crayons magiques qui dessinent en 4D",
        "un kit de chimie pour créer de nouvelles saveurs de glace impossibles",
        "des poupées astronautes qui vivent sur la Lune en sucre",
        "un détecteur de portails vers d'autres dimensions dans la maison",
        "des figurines de fantômes célèbres de l'histoire",
        "un jeu où on gère une entreprise de licornes",
        "un kit pour élever des plantes carnivores gentilles",
        "des voitures télécommandées qui roulent sur les murs et au plafond",
        "un téléphone jouet pour appeler les extraterrestres",
        "un globe terrestre où tous les continents sont des desserts différents"
    ];

    // Fonction pour générer le prompt
    const generatePrompt = (index) => {
        const toyIdea = TOY_IDEAS[index % TOY_IDEAS.length];
        return `Publicité TV années 80-90 pour ${toyIdea}, style rétro français, voix off enthousiaste, dialogues en français, esthétique VHS`;
    };

    // === GESTION DE LA PERSISTENCE ===
    
    const loadState = () => {
        try {
            const saved = localStorage.getItem(CONFIG.storageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn("⚠️ Impossible de charger l'état sauvegardé");
        }
        return {
            generatedVideos: [],
            videosGenerated: 0,
            existingVideoUrls: [],
            pendingGenerations: 0
        };
    };

    const saveState = (state) => {
        try {
            state.existingVideoUrls = Array.from(existingVideoUrls);
            state.generatedVideos = generatedVideos;
            state.videosGenerated = videosGenerated;
            state.pendingGenerations = pendingGenerations;
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
        } catch (e) {
            console.warn("⚠️ Impossible de sauvegarder l'état");
        }
    };

    const clearState = () => {
        localStorage.removeItem(CONFIG.storageKey);
        console.log("🗑️ État nettoyé");
    };

    // Charger l'état
    let state = loadState();
    let generatedVideos = state.generatedVideos;
    let videosGenerated = state.videosGenerated;
    let existingVideoUrls = new Set(state.existingVideoUrls);
    let pendingGenerations = state.pendingGenerations || 0;

    // Vérifier reprise
    if (videosGenerated > 0) {
        console.log(`♻️ REPRISE après rechargement`);
        console.log(`📊 ${videosGenerated}/${CONFIG.numberOfVideos} vidéos générées`);
        console.log(`⏳ ${pendingGenerations} générations en cours\n`);
        
        if (videosGenerated >= CONFIG.numberOfVideos) {
            console.log("✅ Toutes les vidéos ont déjà été générées !");
            displayResults();
            return;
        }
    } else {
        console.log(`🎬 Génération PARALLÈLE de ${CONFIG.numberOfVideos} vidéos`);
        console.log(`⚡ ${CONFIG.concurrentGenerations} générations simultanées\n`);
    }

    window.resetVideoGenerator = () => {
        clearState();
        console.log("✅ Générateur réinitialisé. Rechargez la page.");
    };

    // === ENREGISTRER VIDÉOS EXISTANTES ===
    
    if (existingVideoUrls.size === 0) {
        const existingVideos = document.querySelectorAll('video[src]');
        existingVideos.forEach(vid => {
            if (vid.src) {
                existingVideoUrls.add(vid.src.split('?')[0]);
            }
        });
        console.log(`📊 ${existingVideoUrls.size} vidéos existantes ignorées\n`);
        saveState(state);
    }

    // === TÉLÉCHARGEMENT AUTOMATIQUE ===

    const autoDownloadVideo = async (videoInfo, retryCount = 0) => {
        const maxRetries = CONFIG.maxDownloadRetries;

        if (videoInfo.downloaded) return;

        try {
            console.log(`⏳ Attente avant téléchargement vidéo ${videoInfo.index}...`);
            await new Promise(resolve => setTimeout(resolve, CONFIG.delayBeforeDownload));

            console.log(`📥 Téléchargement vidéo ${videoInfo.index}...`);

            const response = await fetch(videoInfo.url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();

            // Vérifier que le blob est valide et non vide
            if (!blob || blob.size === 0) {
                throw new Error("Blob vide ou invalide");
            }

            // Vérifier que c'est bien une vidéo
            if (!blob.type.startsWith('video/')) {
                throw new Error(`Type invalide: ${blob.type} (attendu: video/*)`);
            }

            console.log(`   Taille: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);

            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `video-${videoInfo.index}-${Date.now()}.mp4`;

            document.body.appendChild(link);
            link.click();

            // Attendre un peu avant de nettoyer pour s'assurer que le téléchargement démarre
            await new Promise(resolve => setTimeout(resolve, 1000));

            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            console.log(`✅ Vidéo ${videoInfo.index} téléchargée !`);

            videoInfo.downloaded = true;
            saveState(state);

        } catch (error) {
            console.error(`❌ Erreur téléchargement vidéo ${videoInfo.index}: ${error.message}`);

            // Retry si possible
            if (retryCount < maxRetries) {
                const retryDelay = Math.min(3000 * Math.pow(2, retryCount), 15000);
                console.log(`🔄 Nouvelle tentative téléchargement ${retryCount + 1}/${maxRetries} dans ${retryDelay/1000}s...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return autoDownloadVideo(videoInfo, retryCount + 1);
            } else {
                console.error(`💥 Échec définitif du téléchargement vidéo ${videoInfo.index}`);
                throw error;
            }
        }
    };

    // === DÉTECTION CONTINUE DES NOUVELLES VIDÉOS ===

    let detectionRunning = true;

    const detectNewVideos = async () => {
        console.log("👁️ Détection continue avec MutationObserver démarrée...\n");

        // Fonction pour traiter une nouvelle vidéo détectée
        const processNewVideo = (videoElement) => {
            if (!videoElement.src) return;

            const urlBase = videoElement.src.split('?')[0];

            // Vérifier si c'est une nouvelle vidéo
            if (!existingVideoUrls.has(urlBase) &&
                !generatedVideos.some(v => v.urlBase === urlBase)) {

                videosGenerated++;
                pendingGenerations = Math.max(0, pendingGenerations - 1);

                const videoInfo = {
                    index: videosGenerated,
                    url: videoElement.src,
                    urlBase: urlBase,
                    timestamp: new Date().toISOString(),
                    downloaded: false
                };

                generatedVideos.push(videoInfo);
                existingVideoUrls.add(urlBase);
                saveState(state);

                console.log(`✅ NOUVELLE VIDÉO ${videosGenerated}/${CONFIG.numberOfVideos} détectée !`);
                console.log(`   En attente: ${pendingGenerations} générations`);

                // Téléchargement automatique
                if (CONFIG.autoDownload) {
                    autoDownloadVideo(videoInfo).catch(err =>
                        console.error(`Erreur téléchargement: ${err.message}`)
                    );
                }
            }
        };

        // MutationObserver pour détecter les nouvelles vidéos en temps réel
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                // Vérifier les nouveaux noeuds ajoutés
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) { // Element node
                        // Vérifier si c'est une vidéo
                        if (node.tagName === 'VIDEO' && node.src) {
                            processNewVideo(node);
                        }
                        // Vérifier les vidéos dans les descendants
                        const videos = node.querySelectorAll?.('video[src]');
                        videos?.forEach(processNewVideo);
                    }
                }

                // Vérifier les attributs modifiés (src ajouté à une vidéo existante)
                if (mutation.type === 'attributes' &&
                    mutation.target.tagName === 'VIDEO' &&
                    mutation.attributeName === 'src') {
                    processNewVideo(mutation.target);
                }
            }
        });

        // Observer tout le document
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src']
        });

        // Polling de secours (au cas où MutationObserver rate quelque chose)
        while (detectionRunning && videosGenerated < CONFIG.numberOfVideos) {
            const videoElements = document.querySelectorAll('video[src]');
            videoElements.forEach(processNewVideo);

            await new Promise(resolve => setTimeout(resolve, CONFIG.pollInterval));
        }

        observer.disconnect();
        console.log("\n🛑 Détection arrêtée (objectif atteint ou arrêt manuel)");
    };

    // === LANCEMENT D'UNE GÉNÉRATION ===

    const triggerGeneration = async (generationNumber, retryCount = 0) => {
        const maxRetries = CONFIG.maxClickRetries;

        try {
            // Attendre le champ textarea
            let textarea = document.querySelector('textarea');
            let attempts = 0;
            while (!textarea && attempts < 10) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                textarea = document.querySelector('textarea');
                attempts++;
            }
            if (!textarea) throw new Error("Champ texte non trouvé");

            // Remplir le prompt avec une idée différente
            const prompt = generatePrompt(generationNumber - 1);
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLTextAreaElement.prototype, 'value'
            ).set;
            nativeInputValueSetter.call(textarea, prompt);
            textarea.dispatchEvent(new Event('input', { bubbles: true }));

            console.log(`💡 Prompt: "${prompt.substring(0, 80)}..."`);

            await new Promise(resolve => setTimeout(resolve, 500));

            // Trouver et cliquer sur le bouton
            const buttons = document.querySelectorAll('button');
            let targetButton = null;
            buttons.forEach(button => {
                const span = button.querySelector('span.sr-only');
                if (span && span.textContent.trim() === 'Create video') {
                    targetButton = button;
                }
            });

            if (!targetButton) throw new Error("Bouton 'Create video' non trouvé");

            // Vérifier l'état du bouton avant de cliquer
            const isDisabled = targetButton.disabled || targetButton.getAttribute('aria-disabled') === 'true';
            if (isDisabled) {
                throw new Error("Bouton désactivé");
            }

            targetButton.click();

            // Attendre et vérifier si une génération a vraiment démarré
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Vérifier plusieurs indicateurs qu'une génération est active
            const hasLoader = document.querySelector('[role="status"]') ||
                            document.querySelector('.loading') ||
                            document.querySelector('[class*="loader"]') ||
                            document.querySelector('[class*="spinner"]');

            const buttonNowDisabled = targetButton.disabled ||
                                    targetButton.getAttribute('aria-disabled') === 'true' ||
                                    targetButton.classList.contains('disabled');

            // Vérifier si le textarea est vide (signe qu'une génération a démarré)
            const textareaAfter = document.querySelector('textarea');
            const textareaCleared = textareaAfter && textareaAfter.value === '';

            // Vérifier s'il y a un indicateur de progression
            const hasProgress = document.querySelector('[class*="progress"]') ||
                              document.querySelector('[aria-busy="true"]');

            const generationStarted = hasLoader || buttonNowDisabled || textareaCleared || hasProgress;

            if (!generationStarted) {
                throw new Error("Le clic n'a pas lancé de génération");
            }

            pendingGenerations++;
            saveState(state);

            console.log(`▶️  Génération #${generationNumber} lancée avec succès ! (${pendingGenerations} en cours)`);

        } catch (error) {
            console.error(`❌ Erreur génération #${generationNumber}: ${error.message}`);

            // Retry si possible
            if (retryCount < maxRetries) {
                console.log(`🔄 Nouvelle tentative ${retryCount + 1}/${maxRetries} dans ${CONFIG.retryClickDelay/1000}s...`);
                await new Promise(resolve => setTimeout(resolve, CONFIG.retryClickDelay));
                return triggerGeneration(generationNumber, retryCount + 1);
            } else {
                console.error(`💥 Échec définitif de la génération #${generationNumber} après ${maxRetries} tentatives`);
                pendingGenerations = Math.max(0, pendingGenerations - 1);
                saveState(state);
                throw error;
            }
        }
    };

    // === LANCEMENT PAR VAGUES ===

    const launchGenerations = async () => {
        const remaining = CONFIG.numberOfVideos - videosGenerated;
        const batches = Math.ceil(remaining / CONFIG.concurrentGenerations);

        console.log(`🚀 Lancement de ${remaining} générations en ${batches} vague(s)\n`);

        let generationCounter = videosGenerated + 1;
        const failedGenerations = [];

        for (let batch = 0; batch < batches; batch++) {
            const videosInBatch = Math.min(
                CONFIG.concurrentGenerations,
                CONFIG.numberOfVideos - (videosGenerated + pendingGenerations)
            );

            console.log(`\n📦 VAGUE ${batch + 1}/${batches} : ${videosInBatch} génération(s)`);

            // Lancer les générations de cette vague
            for (let i = 0; i < videosInBatch; i++) {
                try {
                    await triggerGeneration(generationCounter);
                    generationCounter++;
                } catch (error) {
                    console.error(`💥 Génération ${generationCounter} a échoué définitivement`);
                    failedGenerations.push(generationCounter);
                    generationCounter++;
                }

                // Petit délai entre chaque clic
                if (i < videosInBatch - 1) {
                    await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenClicks));
                }
            }

            // Attendre avant la prochaine vague (sauf dernière)
            if (batch < batches - 1) {
                console.log(`\n⏳ Attente de ${CONFIG.delayBetweenBatches / 1000}s avant la prochaine vague...`);
                await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenBatches));
            }
        }

        if (failedGenerations.length > 0) {
            console.log(`\n⚠️ ${failedGenerations.length} génération(s) ont échoué: ${failedGenerations.join(', ')}`);
        }

        console.log("\n✅ Toutes les générations ont été lancées !");
    };

    // === DÉMARRAGE ===
    
    // Lancer la détection en arrière-plan
    detectNewVideos();
    
    // Lancer les générations
    await launchGenerations();
    
    // Attendre que toutes les vidéos soient détectées
    console.log("\n⏳ Attente de la fin de toutes les générations...\n");
    
    while (videosGenerated < CONFIG.numberOfVideos && detectionRunning) {
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    detectionRunning = false;
    displayResults();

    // === AFFICHAGE RÉSULTATS ===
    
    function displayResults() {
        console.log("\n" + "=".repeat(80));
        console.log("📊 RÉSUMÉ DES VIDÉOS GÉNÉRÉES");
        console.log("=".repeat(80));
        
        generatedVideos.forEach((video, index) => {
            const status = video.downloaded ? "✅ Téléchargée" : "❌ Non téléchargée";
            console.log(`\n[${index + 1}] ${status} - ${video.timestamp}`);
            console.log(`    URL: ${video.url.split('?')[0].substring(0, 60)}...`);
        });
        
        console.log("\n" + "=".repeat(80));
        console.log("💾 COMMANDES DISPONIBLES :");
        console.log("=".repeat(80));
        console.log("\n1. downloadAllVideos() - Télécharger toutes");
        console.log("2. downloadVideo(1) - Télécharger la vidéo #1");
        console.log("3. resetVideoGenerator() - Réinitialiser\n");
    }

    // === FONCTIONS GLOBALES ===
    
    window.downloadAllVideos = async () => {
        const videos = loadState().generatedVideos;
        console.log("⏳ Téléchargement de toutes les vidéos...\n");
        
        for (let i = 0; i < videos.length; i++) {
            await autoDownloadVideo(videos[i]);
            if (i < videos.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        console.log("\n✅ Tous les téléchargements terminés !");
    };

    window.downloadVideo = async (index) => {
        const videos = loadState().generatedVideos;
        
        if (index < 1 || index > videos.length) {
            console.error(`❌ Index invalide (1-${videos.length})`);
            return;
        }
        
        await autoDownloadVideo(videos[index - 1]);
    };

})();