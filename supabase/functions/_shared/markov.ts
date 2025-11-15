// Algorithme Markov Chain - Analyse des transitions d'états
import type { DrawResult, PredictionResult } from "./types.ts";
import { selectBalancedNumbers, log } from "./utils.ts";

const EPSILON = 1e-10;

/**
 * Algorithme 10: Markov Chain (Chaînes de Markov)
 * Analyse les transitions entre états (numéros) pour prédire les prochains
 */
export function markovChainAlgorithm(
  results: DrawResult[]
): PredictionResult {
  if (results.length < 5) {
    return {
      numbers: [1, 2, 3, 4, 5],
      confidence: 0.2,
      algorithm: "Markov Chain (Données Insuffisantes)",
      factors: ["Données insuffisantes", "Mode dégradé"],
      score: 0.2,
      category: "markov",
    };
  }

  try {
    // Construire la matrice de transition
    const transitionMatrix: Record<number, Record<number, number>> = {};
    for (let i = 1; i <= 90; i++) {
      transitionMatrix[i] = {};
      for (let j = 1; j <= 90; j++) {
        transitionMatrix[i][j] = 0;
      }
    }

    // Compter les transitions
    for (let i = 0; i < results.length - 1; i++) {
      const current = results[i].winning_numbers;
      const next = results[i + 1].winning_numbers;

      // Pour chaque numéro du tirage actuel
      current.forEach(currNum => {
        // Vers chaque numéro du tirage suivant
        next.forEach(nextNum => {
          transitionMatrix[currNum][nextNum]++;
        });
      });
    }

    // Normaliser la matrice (probabilités)
    for (let i = 1; i <= 90; i++) {
      const total = Object.values(transitionMatrix[i]).reduce((sum, val) => sum + val, 0);
      if (total > 0) {
        for (let j = 1; j <= 90; j++) {
          transitionMatrix[i][j] /= total;
        }
      }
    }

    // Obtenir l'état actuel (derniers numéros)
    const lastDraw = results[results.length - 1].winning_numbers;

    // Calculer les probabilités de transition depuis l'état actuel
    const nextStateProbabilities: Record<number, number> = {};
    for (let i = 1; i <= 90; i++) {
      nextStateProbabilities[i] = 0;
    }

    // Moyenne des probabilités de transition depuis chaque numéro du dernier tirage
    lastDraw.forEach(num => {
      for (let j = 1; j <= 90; j++) {
        nextStateProbabilities[j] += transitionMatrix[num][j];
      }
    });

    // Normaliser par le nombre de numéros du dernier tirage
    for (let i = 1; i <= 90; i++) {
      nextStateProbabilities[i] /= lastDraw.length;
    }

    // Sélectionner les 5 numéros avec les plus hautes probabilités
    const sortedNumbers = Object.entries(nextStateProbabilities)
      .sort(([, a], [, b]) => b - a)
      .map(([num]) => parseInt(num));

    const topCandidates = sortedNumbers.slice(0, 15);
    const prediction = selectBalancedNumbers(topCandidates, 5);

    // Calculer la confiance basée sur la force des transitions
    const avgTransitionStrength = prediction.reduce((sum, num) => {
      return sum + nextStateProbabilities[num];
    }, 0) / 5;

    const confidence = Math.min(0.85, Math.tanh(avgTransitionStrength * 10) + 0.2);

    return {
      numbers: prediction,
      confidence,
      algorithm: "Markov Chain",
      factors: [
        "Matrice de transition",
        "Probabilités d'état",
        `${lastDraw.length} états actuels`,
      ],
      score: confidence * 0.75,
      category: "markov",
    };
  } catch (error) {
    log("error", `Markov Chain failed for ${results.length} results`, { error });
    return {
      numbers: [1, 2, 3, 4, 5],
      confidence: 0.2,
      algorithm: "Markov Chain (Erreur)",
      factors: ["Erreur de calcul", "Mode dégradé"],
      score: 0.2,
      category: "markov",
    };
  }
}
