-- BIT(1) 在部分 JDBC/Hibernate 组合下与 boolean 映射易异常；改为 TINYINT(1) 与常见 MySQL 习惯一致
ALTER TABLE banners MODIFY COLUMN enabled TINYINT(1) NOT NULL DEFAULT 1;
