package com.aidea.backend.global.config;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

@Configuration
public class VectorDataSourceConfig {

    @Bean
    @ConfigurationProperties("vector-datasource")
    public DataSourceProperties vectorDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(name = "vectorDataSource")
    public DataSource vectorDataSource() {
        return vectorDataSourceProperties()
                .initializeDataSourceBuilder()
                .build();
    }

    @Bean(name = "vectorJdbc")
    public NamedParameterJdbcTemplate vectorJdbc(@Qualifier("vectorDataSource") DataSource ds) {
        return new NamedParameterJdbcTemplate(ds);
    }
}