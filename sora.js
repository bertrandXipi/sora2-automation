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

    // Concepts maison de retraite : citation philosophique + chute réaliste
    const NURSING_HOME_CONCEPTS = [
        {quote:"La vie c'est comme une bicyclette il faut avancer pour ne pas perdre l'équilibre-Einstein",reality:"Ouais super sauf que Mme Dupont a volé le déambulateur de M.Martin faut gérer",location:"couloir",sound:"record scratch"},
        {quote:"Le bonheur n'est pas une destination c'est une façon de voyager-inconnu",reality:"Sympa mais la famille Rousseau menace de porter plainte pour les draps pas changés",location:"chambre 7",sound:"trombone triste"},
        {quote:"Chaque instant est un nouveau départ-T.S.Eliot",reality:"Ouais le papy chambre 12 a encore oublié qu'il a déjeuné et gueule qu'on l'affame",location:"salle à manger",sound:"klaxon"},
        {quote:"La sagesse commence dans l'émerveillement-Socrate",reality:"Cool mais Mme Jeanne s'est encore barrée en pyjama direction Intermarché",location:"hall entrée",sound:"alarme"},
        {quote:"Vivre c'est choisir-Sartre",reality:"Super sauf qu'ils ont tous choisi la purée et on a fait des haricots",location:"cuisine",sound:"sifflet"},
        {quote:"L'essentiel est invisible pour les yeux-St Exupéry",reality:"Justement c'est ça le problème personne voit la merde sur le mur des toilettes",location:"sanitaires",sound:"boing"},
        {quote:"Le temps est un grand maître-Corneille",reality:"Ouais et il vient de m'apprendre que 3 résidents ont rendez-vous médecin en même temps",location:"bureau",sound:"tic-tac accéléré"},
        {quote:"Aimer c'est tout donner-Ste Thérèse",reality:"Ouais M.Robert a tout donné effectivement son dentier est dans les plantes vertes",location:"salon",sound:"crash"},
        {quote:"La patience est la clé de la joie-proverbe arabe",reality:"Cool moi j'ai les clés de la réserve de couches et y en a plus",location:"local stockage",sound:"klaxon"},
        {quote:"Il n'y a pas de hasard que des rendez-vous-Paul Éluard",reality:"Genre le rendez-vous où 4 familles débarquent en même temps pour râler",location:"accueil",sound:"sirène"},
        {quote:"La vie est un mystère qu'il faut vivre-Gandhi",reality:"Ouais le mystère c'est comment Mme Paulette a 3 desserts dans sa chambre",location:"office",sound:"whoosh"},
        {quote:"Celui qui déplace une montagne commence par déplacer de petites pierres-Confucius",reality:"Ouais et celui qui déplace M.Fernand seul se chope un lumbago direct",location:"chambre 15",sound:"crack"},
        {quote:"La beauté sauvera le monde-Dostoïevski",reality:"Spoiler elle sauvera pas la moquette du couloir B faut la changer depuis 2018",location:"couloir B",sound:"déchirement"},
        {quote:"Tout passe tout casse tout lasse-proverbe",reality:"Justement tout a cassé la chasse d'eau chambre 9 et ça m'a bien lassé",location:"WC chambre 9",sound:"splash"},
        {quote:"L'espoir fait vivre-proverbe",reality:"Ouais j'espère que la collègue de nuit va enfin pointer à l'heure pour une fois",location:"vestiaire",sound:"horloge"},
        {quote:"Après la pluie le beau temps-proverbe",reality:"Après l'inspection de la DDASS on va surtout avoir des emmerdes",location:"bureau direction",sound:"orage"},
        {quote:"La vie est belle-Roberto Benigni",reality:"Elle l'est moins quand tu nettoies du vomi à 6h du mat pour 1600 balles",location:"salle de bain",sound:"splash"},
        {quote:"Carpe diem profite du jour présent-Horace",reality:"Je profite surtout de ma pause clope de 5 min avant le prochain code brun",location:"parking",sound:"briquet"},
        {quote:"L'amour donne des ailes-inconnu",reality:"Ouais et Mme Berthe a pris ça littéralement elle a sauté du lit",location:"chambre 3",sound:"whoosh crash"},
        {quote:"La liberté commence où l'ignorance finit-Victor Hugo",reality:"La liberté finit quand tu réalises que t'as 12 toilettes à faire",location:"local ménage",sound:"soupir"},
        {quote:"Le rire est le propre de l'homme-Rabelais",reality:"Le propre de M.Gérard c'est surtout son caleçon faut le changer",location:"chambre 18",sound:"rire nerveux"},
        {quote:"Connais-toi toi-même-Socrate",reality:"Je me connais j'ai besoin de vacances et d'une augmentation",location:"salle de pause",sound:"soupir profond"},
        {quote:"La musique adoucit les mœurs-proverbe",reality:"Pas celle de la télé du salon que Mme Louise met à fond depuis 7h",location:"salon TV",sound:"volume max"},
        {quote:"Qui va lentement va sûrement-proverbe",reality:"Qui va lentement c'est M.André il met 45min pour aller aux toilettes",location:"couloir",sound:"escargot"},
        {quote:"Il faut cultiver notre jardin-Voltaire",reality:"Il faut surtout cultiver la patience avec la famille Moreau qui veut un menu perso",location:"jardin",sound:"sarcasme"},
        {quote:"La nuit porte conseil-proverbe",reality:"La nuit porte surtout 3 appels de chambre et un déambulateur coincé",location:"poste nuit",sound:"sonnette×3"},
        {quote:"Mieux vaut prévenir que guérir-proverbe",reality:"J'avais prévenu que M.Jacques allait tomber bah voilà il est tombé",location:"couloir principal",sound:"boum"},
        {quote:"Les petits ruisseaux font les grandes rivières-proverbe",reality:"Les petites fuites font les grandes inondations chambre 22 envoyez la serpillière",location:"chambre 22",sound:"eau qui coule"},
        {quote:"Rien ne sert de courir il faut partir à point-La Fontaine",reality:"Je pars à point mais je cours quand même y a 3 sonnettes qui bipent",location:"poste soins",sound:"course"},
        {quote:"L'art lave notre âme de la poussière du quotidien-Picasso",reality:"La serpillière lave le sol de la merde du quotidien c'est déjà ça",location:"local entretien",sound:"splash"},
        {quote:"La simplicité est la sophistication suprême-Léonard de Vinci",reality:"La sophistication c'est réussir à habiller Mme Renée qui veut pas",location:"chambre 4",sound:"lutte"},
        {quote:"On ne voit bien qu'avec le cœur-Le Petit Prince",reality:"On voit surtout avec le nez que quelqu'un a chié dans le couloir",location:"couloir sud",sound:"mouche"},
        {quote:"Tout est bien qui finit bien-Shakespeare",reality:"Rien finit bien ma journée termine dans 8h et j'ai déjà envie de démissionner",location:"vestiaire",sound:"pleurs"},
        {quote:"La foi soulève des montagnes-Bible",reality:"La foi soulèvera pas M.Lebrun 120kg faut être 3 minimum",location:"chambre 11",sound:"effort"},
        {quote:"Le silence est d'or-proverbe",reality:"Le silence chez nous ça veut dire qu'un résident prépare un coup tordu",location:"salle commune",sound:"suspense"},
        {quote:"Là où il y a de la vie il y a de l'espoir-Cicéron",reality:"Là où y a M.Pierre y a de la chiasse faut prévenir la blanchisserie",location:"buanderie",sound:"alarme"},
        {quote:"Les actes parlent plus fort que les mots-Lincoln",reality:"Les actes de Mme Odette parlent fort elle a giflé l'aide-soignant",location:"salle d'activités",sound:"claque"},
        {quote:"Le meilleur moment pour planter un arbre c'était il y a 20 ans-proverbe chinois",reality:"Le meilleur moment pour changer de boulot c'était avant de commencer celui-ci",location:"jardin",sound:"regret"},
        {quote:"Chaque jour est une nouvelle chance-inconnu",reality:"Une nouvelle chance de trouver Mme Ginette dans la chambre de M.Robert",location:"étage 2",sound:"surprise"},
        {quote:"La gratitude transforme ce que nous avons en suffisant-Melody Beattie",reality:"Je suis grateful que ma pause arrive dans 10min et pas une de plus",location:"couloir",sound:"timer"}
    ];

    // Overlays texte pour citations et réalité
    const TEXT_OVERLAYS = [
        {quote_style:"typo élégante cursive dorée qui apparaît mot par mot",reality_style:"gros texte impact blanc bordure noire qui claque"},
        {quote_style:"animation particules lumineuses lettres zen",reality_style:"texte jaune fluo style alerte urgence"},
        {quote_style:"fade in doux lettres serif classiques",reality_style:"slide brutal gauche droite police grasse"},
        {quote_style:"écriture manuscrite qui s'écrit progressivement",reality_style:"all caps rouge qui vibre"},
        {quote_style:"lettres qui flottent délicatement",reality_style:"bloc texte qui drop du haut avec impact"}
    ];

    // Fonction pour générer le prompt optimisé TikTok (max 2000 caractères)
    const generatePrompt = (index) => {
        const concept = NURSING_HOME_CONCEPTS[index % NURSING_HOME_CONCEPTS.length];
        const overlay = TEXT_OVERLAYS[index % TEXT_OVERLAYS.length];

        const prompt = `Maison retraite ${concept.location}.
0-3s:plan fixe calme ambiance douce filtre pastel.Musique piano légère apaisante
3-7s:voix off femme jeune ton doux philosophique:"${concept.quote}".Texte overlay:${overlay.quote_style}
7-10s:RUPTURE BRUTALE.${concept.sound}.Voix off homme chef grave pragmatique:"${concept.reality}".Texte overlay:${overlay.reality_style}.Changement musique brusque
9:16 vertical.Éclairage naturel maison retraite réaliste.Couleurs ternes institutionnelles puis vives à la chute.Pas de personnages visibles juste décor et voix off
Comédie contraste poésie réalité quotable viral relatable soignants`;

        // Vérifier la longueur et logger
        console.log(`📏 Prompt longueur: ${prompt.length} caractères`);
        if (prompt.length > 2000) {
            console.warn(`⚠️ ATTENTION: Prompt trop long! ${prompt.length}/2000`);
        }

        return prompt;
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