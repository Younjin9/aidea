package com.aidea.backend.domain.recommendation.util;

import java.util.List;

public class VectorUtils {

    private VectorUtils() {}

    public static float[] average(List<float[]> vectors) {
        if (vectors == null || vectors.isEmpty()) return null;

        int dim = vectors.get(0).length;
        float[] avg = new float[dim];

        for (float[] v : vectors) {
            if (v == null || v.length != dim) continue;
            for (int i = 0; i < dim; i++) {
                avg[i] += v[i];
            }
        }
        for (int i = 0; i < dim; i++) {
            avg[i] /= vectors.size();
        }
        return avg;
    }

    // pgvector 파라미터 문자열: [0.1,0.2,...]
    public static String toPgVectorLiteral(float[] vector) {
        if (vector == null) return "[]";
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(vector[i]);
        }
        sb.append("]");
        return sb.toString();
    }
}