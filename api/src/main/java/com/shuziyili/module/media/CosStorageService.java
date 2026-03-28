package com.shuziyili.module.media;

import com.qcloud.cos.COSClient;
import com.qcloud.cos.ClientConfig;
import com.qcloud.cos.auth.BasicCOSCredentials;
import com.qcloud.cos.auth.COSCredentials;
import com.qcloud.cos.exception.CosServiceException;
import com.qcloud.cos.model.COSObjectSummary;
import com.qcloud.cos.model.ListObjectsRequest;
import com.qcloud.cos.model.ObjectListing;
import com.qcloud.cos.model.ObjectMetadata;
import com.qcloud.cos.model.PutObjectRequest;
import com.qcloud.cos.region.Region;
import com.shuziyili.config.CosProperties;
import java.io.InputStream;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;
import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CosStorageService {

  private static final long MAX_BYTES = 10L * 1024 * 1024;
  private static final Pattern SAFE_EXT = Pattern.compile("(?i)^(jpe?g|png|gif|webp)$");

  private final CosProperties props;
  private COSClient client;

  public CosStorageService(CosProperties props) {
    this.props = props;
  }

  @PostConstruct
  void init() {
    if (!props.isConfigured()) {
      return;
    }
    COSCredentials cred = new BasicCOSCredentials(props.getSecretId(), props.getSecretKey());
    ClientConfig clientConfig = new ClientConfig(new Region(props.getRegion()));
    this.client = new COSClient(cred, clientConfig);
  }

  @PreDestroy
  void shutdown() {
    if (client != null) {
      client.shutdown();
    }
  }

  public boolean ready() {
    return props.isConfigured() && client != null;
  }

  public String publicUrl(String objectKey) {
    String base = props.getPublicBaseUrl().replaceAll("/+$", "");
    return base + "/" + objectKey;
  }

  public List<MediaItem> list(String prefix) {
    ensureReady();
    String p = normalizeListPrefix(prefix);
    ListObjectsRequest req = new ListObjectsRequest();
    req.setBucketName(props.getBucket());
    req.setPrefix(p);
    req.setMaxKeys(500);
    ObjectListing listing = client.listObjects(req);
    List<MediaItem> out = new ArrayList<>();
    for (COSObjectSummary s : listing.getObjectSummaries()) {
      if (s.getKey().endsWith("/")) {
        continue;
      }
      MediaItem m = new MediaItem();
      m.key = s.getKey();
      m.size = s.getSize();
      m.lastModified = s.getLastModified().getTime();
      m.url = publicUrl(s.getKey());
      out.add(m);
    }
    return out;
  }

  public UploadResult upload(MultipartFile file) {
    ensureReady();
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("empty_file");
    }
    if (file.getSize() > MAX_BYTES) {
      throw new IllegalArgumentException("file_too_large");
    }
    String ext = extensionOf(file.getOriginalFilename());
    if (ext == null || !SAFE_EXT.matcher(ext).matches()) {
      throw new IllegalArgumentException("unsupported_type");
    }

    String day =
        DateTimeFormatter.ofPattern("yyyy/MM/dd").withZone(ZoneOffset.UTC).format(Instant.now());
    String key = normalizeKeyPrefix(props.getKeyPrefix()) + day + "/" + UUID.randomUUID() + "." + ext;

    ObjectMetadata meta = new ObjectMetadata();
    meta.setContentLength(file.getSize());
    String ct = file.getContentType();
    if (ct != null && !ct.isBlank()) {
      meta.setContentType(ct);
    }
    try (InputStream in = file.getInputStream()) {
      PutObjectRequest put = new PutObjectRequest(props.getBucket(), key, in, meta);
      client.putObject(put);
    } catch (Exception e) {
      throw new IllegalStateException("upload_failed", e);
    }

    UploadResult r = new UploadResult();
    r.key = key;
    r.url = publicUrl(key);
    return r;
  }

  public void delete(String key) {
    ensureReady();
    if (key == null || key.isBlank()) {
      throw new IllegalArgumentException("empty_key");
    }
    String kp = normalizeKeyPrefix(props.getKeyPrefix());
    if (!key.startsWith(kp)) {
      throw new IllegalArgumentException("invalid_key");
    }
    try {
      client.deleteObject(props.getBucket(), key);
    } catch (CosServiceException e) {
      throw new IllegalStateException("delete_failed", e);
    }
  }

  private void ensureReady() {
    if (!ready()) {
      throw new IllegalStateException("cos_not_configured");
    }
  }

  private String normalizeListPrefix(String prefix) {
    String kp = normalizeKeyPrefix(props.getKeyPrefix());
    if (prefix == null || prefix.isBlank()) {
      return kp;
    }
    String p = prefix.trim();
    if (!p.endsWith("/")) {
      p = p + "/";
    }
    if (!p.startsWith(kp)) {
      return kp + p.replaceFirst("^/+", "");
    }
    return p;
  }

  private static String normalizeKeyPrefix(String kp) {
    if (kp == null || kp.isBlank()) {
      return "uploads/";
    }
    String s = kp.trim();
    if (!s.endsWith("/")) {
      s = s + "/";
    }
    return s;
  }

  private static String extensionOf(String name) {
    if (name == null) return null;
    int dot = name.lastIndexOf('.');
    if (dot < 0 || dot == name.length() - 1) return null;
    return name.substring(dot + 1).toLowerCase(Locale.ROOT);
  }

  public static class MediaItem {
    public String key;
    public long size;
    public long lastModified;
    public String url;
  }

  public static class UploadResult {
    public String key;
    public String url;
  }
}
