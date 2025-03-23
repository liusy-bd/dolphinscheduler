package org.apache.dolphinscheduler.spi.params.base;


import lombok.Data;

@Data
public class TableColumnInfo {

    private String columnName;
    private String columnType;
    private String columnRemarks;
    private boolean selected; // 用于标记是否勾选
}
