package com.aidea.backend.global.infra.s3;

import io.awspring.cloud.s3.S3Template;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

  private final S3Template s3Template;

  @Value("${spring.cloud.aws.s3.bucket}")
  private String bucket;

  /**
   * 파일을 S3에 업로드하고 접근 가능한 URL을 반환합니다.
   */
  public String uploadFile(MultipartFile file, String folder) {
    String originalFilename = file.getOriginalFilename();
    String extension = "";

    if (originalFilename != null && originalFilename.contains(".")) {
      extension = originalFilename.substring(originalFilename.lastIndexOf("."));
    }

    String savedFilename = folder + "/" + UUID.randomUUID().toString() + extension;

    try (InputStream inputStream = file.getInputStream()) {
      s3Template.upload(bucket, savedFilename, inputStream);

      // S3 URL 구성 (Region에 따라 형식이 다를 수 있음)
      // 기본 형식: https://{bucket}.s3.{region}.amazonaws.com/{key}
      return String.format("https://%s.s3.ap-northeast-2.amazonaws.com/%s", bucket, savedFilename);
    } catch (IOException e) {
      log.error("S3 파일 업로드 실패", e);
      throw new RuntimeException("파일 업로드 중 오류가 발생했습니다.");
    }
  }
}
