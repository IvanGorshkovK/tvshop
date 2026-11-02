package com.tvshop.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class SpecEntry {

    @Column(name = "spec_name", length = 200, nullable = false)
    private String name;

    @Column(name = "spec_value", length = 500)
    private String value;

    @Column(name = "spec_group", length = 60)
    private String group;

    public SpecEntry(String name, String value) {
        this.name = name;
        this.value = value;
    }

    public SpecEntry(String name, String value, String group) {
        this.name = name;
        this.value = value;
        this.group = group;
    }
}
