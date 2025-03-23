/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {computed, onMounted, PropType, ref, h} from 'vue'
import { useI18n } from 'vue-i18n'
import {useDeployMode, useResources, useCustomParams} from '.'
import type {IJsonItem} from '../types'
import {getDatasourceOptionsById} from "@/service/modules/data-quality";
import {
  getDatasourceDatabasesById,
  getDatasourceTableColumnsById,
  getDatasourceTablesById,
  getDatasourceTableColumnsInfoById
} from "@/service/modules/data-source";

export function useSeaTunnelDefine(model: { [field: string]: any }): IJsonItem[] {
  const { t } = useI18n()

  const configEditorSpan = computed(() => (model.useCustom ? 24 : 0))
  const resourceEditorSpan = computed(() => (model.useCustom ? 0 : 24))
  const flinkSpan = computed(() =>
    model.startupScript.includes('flink') ? 24 : 0
  )
  const deployModeSpan = computed(() =>
    model.startupScript.includes('spark') ||
    model.startupScript === 'seatunnel.sh'
      ? 24
      : 0
  )
  const masterSpan = computed(() =>
    model.startupScript.includes('spark') && model.deployMode !== 'local'
      ? 12
      : 0
  )
  const masterUrlSpan = computed(() =>
    model.startupScript.includes('spark') &&
    model.deployMode !== 'local' &&
    (model.master === 'SPARK' || model.master === 'MESOS')
      ? 12
      : 0
  )
  const showClient = computed(() => model.startupScript.includes('spark'))
  const showLocal = computed(() => model.startupScript === 'seatunnel.sh')
  const othersSpan = computed(() =>
    model.startupScript.includes('flink') ||
    model.startupScript === 'seatunnel.sh'
      ? 24
      : 0
  )

  const connectTypeOptions = ref([] as { label: string; value: number }[])
  const srcDatasourceOptions = ref([] as { label: string; value: number }[])
  const srcDatabaseOptions = ref([] as { label: string; value: number }[])
  const srcTableOptions = ref([] as { label: string; value: number }[])
  const srcTableColumnOptions = ref([] as { label: string; value: number }[])
  const targetDatasourceOptions = ref([] as { label: string; value: number }[])
  const targetDatabaseOptions = ref([] as { label: string; value: number }[])
  const targetTableOptions = ref([] as { label: string; value: string }[])
  const targetTableColumnOptions = ref([] as { label: string; value: number }[])
  const writerDatasourceOptions = ref([] as { label: string; value: number }[])
  // 添加响应式变量来存储源表列信息
  const srcTableColumnsData = ref([] as { columnName: string; columnType: string; columnRemarks: string ;selected: boolean}[]);


  const onFieldChange = async (
      value: string | number,
      field: string,
      reset: boolean
  ) => {

    if (field === 'src_connector_type' && typeof value === 'number') {
      const result = await getDatasourceOptionsById(value)
      srcDatasourceOptions.value = result || []
      if (reset) {
        srcDatabaseOptions.value = []
        srcTableOptions.value = []
        srcTableColumnOptions.value = []
        model.src_datasource_id = null
        model.src_database = null
        model.src_table = null
        model.src_field = null
      }
      return
    }
    if (field === 'target_connector_type' && typeof value === 'number') {
      const result = await getDatasourceOptionsById(value)
      targetDatasourceOptions.value = result || []
      if (reset) {
        targetDatabaseOptions.value = []
        targetTableOptions.value = []
        targetTableColumnOptions.value = []
        model.target_datasource_id = null
        model.target_database = null
        model.target_table = null
        model.target_field = null
      }
      return
    }
    if (field === 'writer_connector_type' && typeof value === 'number') {
      const result = await getDatasourceOptionsById(value)
      writerDatasourceOptions.value = result || []
      if (reset) {
        model.writer_datasource_id = null
      }
      return
    }
    if (field === 'src_datasource_id' && typeof value === 'number') {
      const result = await getDatasourceDatabasesById(value)
      srcDatabaseOptions.value = result || []
      if (reset) {
        srcTableOptions.value = []
        srcTableColumnOptions.value = []
        model.src_database = null
        model.src_table = null
        model.src_field = null
      }
    }
    if (field === 'target_datasource_id' && typeof value === 'number') {
      const result = await getDatasourceDatabasesById(value)
      targetDatabaseOptions.value = result || []
      if (reset) {
        targetTableOptions.value = []
        targetTableColumnOptions.value = []
        model.target_database = null
        model.target_table = null
        model.target_field = null
      }
    }

    if (field === 'src_database' && typeof value === 'string') {
      const result = await getDatasourceTablesById(
          model.src_datasource_id,
          value
      )
      srcTableOptions.value = result || []
      if (reset) {
        srcTableColumnOptions.value = []
        model.src_table = null
        model.src_field = null
      }
    }

    if (field === 'target_database' && typeof value === 'string') {
      const result = await getDatasourceTablesById(
          model.target_datasource_id,
          value
      )
      targetTableOptions.value = result || []
      if (reset) {
        targetTableColumnOptions.value = []
        model.target_table = null
        model.target_field = null
      }
    }

    if (field === 'src_table' && typeof value === 'string') {
      // 获取表格列信息
      const tableColumnsInfo = await getDatasourceTableColumnsInfoById(
          model.src_datasource_id,
          model.src_database,
          value
      );
      srcTableColumnsData.value = tableColumnsInfo;
    }
    if (field === 'target_table' && typeof value === 'string') {
      const result = await getDatasourceTableColumnsById(
          model.target_datasource_id,
          model.target_database,
          value
      )
      targetTableColumnOptions.value = result || []
      if (reset) {
        model.target_field = null
      }
    }
  }



  onMounted(async () => {
      connectTypeOptions.value = datasourceTypes.map((item : any) => ({ label: item.code, value: item.id }))


      // 初始化时获取源表列信息
      // todo
      const columnInfo = await getDatasourceTableColumnsInfoById(
          1,
          'dolphinscheduler',
          't_ds_alert'
      );
      console.log(columnInfo); // 验证数据是否正确
      srcTableColumnsData.value = columnInfo;
  })


// 定义表格列配置
  const columnsRef = ref([
    {
      title: '列名',
      key: 'columnName'
    },
    {
      title: '列类型',
      key: 'columnType'
    },
    {
      title: '列备注',
      key: 'columnRemarks'
    }
  ]);

  return [
    {
      type: 'select',
      field: 'src_connector_type',
      name: t('project.node.src_connector_type'),
      options: connectTypeOptions,
      value: model.connectType,
      span: 15,
      props: {
        onUpdateValue: (value: number) => {
          onFieldChange(value, 'src_connector_type', true);
        }
      }
    },
    {
      type: 'select',
      field: 'src_datasource_id',
      name: t('project.node.src_datasource_id'),
      options: srcDatasourceOptions,
      value: model.dataSource,
      span: 15,
      props: {
        onUpdateValue: (value: number) => {
          onFieldChange(value, 'src_datasource_id', true);
        }
      }
    },
    {
      type: 'select',
      field: 'src_database',
      name: t('project.node.src_database'),
      options: srcDatabaseOptions,
      value: model.dataBase,
      span: 15,
      props: {
        onUpdateValue: (value: number) => {
          onFieldChange(value, 'src_database', true);
        }
      }
    },
    {
      type: 'select',
      field: 'src_table',
      name: t('project.node.src_table'),
      options: srcTableOptions,
      value: model.dataTable,
      span: 15,
      props: {
        onUpdateValue: (value: number) => {
          onFieldChange(value, 'src_table', true);
        }
      }
    },
    // 定义表格组件
    // todo
    {
      type: 'custom', // 使用自定义类型
      field: 'src_table_columns',
      name: t('project.node.src_table_columns'),
      span: 50,
      widget: h('div', {
            style: {
              border: '1px solid black' // 添加边框用于测试
            }
          },[
          h('table', {
            class: 'src_table_columns',
            style: {
              borderCollapse: 'collapse',
              width: '210px'
            }// 可添加样式类
          }, [
            h('thead', [
              h('tr', [
                h('th', '列名'),
                h('th', '列类型'),
                h('th', '列备注')
              ])
            ]),
            h('tbody',
                srcTableColumnsData.value.map((option:any) => {
                  return h('tr', [
                    h('td', option.columnName),
                    h('td', option.columnName),
                    h('td', option.columnName)
                  ]);
                }))
          ])]
        )
    },
    {
      type: 'select',
      field: 'startupScript',
      span: 15,
      name: t('project.node.startup_script'),
      options: STARTUP_SCRIPT,
      validate: {
        trigger: ['input', 'blur'],
        required: true,
        message: t('project.node.startup_script_tips')
      },
      props: {
        'on-update:value': (value: boolean) => {
          if (value) {
            if (model.startupScript === 'seatunnel.sh') {
              model.deployMode = 'local'
            }
            if (model.startupScript.includes('spark')) {
              model.deployMode = 'client'
            }
          }
        }
      }
    },
    // SeaTunnel flink parameter
    {
      type: 'select',
      field: 'runMode',
      name: t('project.node.run_mode'),
      options: FLINK_RUN_MODE,
      value: model.runMode,
      span: flinkSpan
    },
    {
      type: 'input',
      field: 'others',
      name: t('project.node.option_parameters'),
      span: othersSpan,
      props: {
        type: 'textarea',
        placeholder: t('project.node.option_parameters_tips')
      }
    },

    // SeaTunnel spark parameter
    useDeployMode(deployModeSpan, showClient, ref(true), showLocal),
    {
      type: 'select',
      field: 'master',
      name: t('project.node.sea_tunnel_master'),
      options: masterTypeOptions,
      value: model.master,
      span: masterSpan
    },
    {
      type: 'input',
      field: 'masterUrl',
      name: t('project.node.sea_tunnel_master_url'),
      value: model.masterUrl,
      span: masterUrlSpan,
      props: {
        placeholder: t('project.node.sea_tunnel_master_url_tips')
      },
      validate: {
        trigger: ['input', 'blur'],
        required: masterUrlSpan.value !== 0,
        validator(validate: any, value: string) {
          if (masterUrlSpan.value !== 0 && !value) {
            return new Error(t('project.node.sea_tunnel_master_url_tips'))
          }
        }
      }
    },

    // SeaTunnel config parameter
    {
      type: 'switch',
      field: 'useCustom',
      name: t('project.node.custom_config')
    },
    {
      type: 'editor',
      field: 'rawScript',
      name: t('project.node.script'),
      span: configEditorSpan,
      validate: {
        trigger: ['input', 'trigger'],
        required: model.useCustom,
        validator(validate: any, value: string) {
          if (model.useCustom && !value) {
            return new Error(t('project.node.script_tips'))
          }
        }
      }
    },
    useResources(resourceEditorSpan, true, 1),
    ...useCustomParams({ model, field: 'localParams', isSimple: true })
  ]
}

export const STARTUP_SCRIPT = [
  {
    label: 'seatunnel.sh',
    value: 'seatunnel.sh'
  },
  {
    label: 'start-seatunnel-flink-13-connector-v2.sh',
    value: 'start-seatunnel-flink-13-connector-v2.sh'
  },
  {
    label: 'start-seatunnel-flink-15-connector-v2.sh',
    value: 'start-seatunnel-flink-15-connector-v2.sh'
  },
  {
    label: 'start-seatunnel-flink-connector-v2.sh',
    value: 'start-seatunnel-flink-connector-v2.sh'
  },
  {
    label: 'start-seatunnel-flink.sh',
    value: 'start-seatunnel-flink.sh'
  },
  {
    label: 'start-seatunnel-spark-2-connector-v2.sh',
    value: 'start-seatunnel-spark-2-connector-v2.sh'
  },
  {
    label: 'start-seatunnel-spark-3-connector-v2.sh',
    value: 'start-seatunnel-spark-3-connector-v2.sh'
  },
  {
    label: 'start-seatunnel-spark-connector-v2.sh',
    value: 'start-seatunnel-spark-connector-v2.sh'
  },
  {
    label: 'start-seatunnel-spark.sh',
    value: 'start-seatunnel-spark.sh'
  }
]

export const FLINK_RUN_MODE = [
  {
    label: 'none',
    value: 'NONE'
  },
  {
    label: 'run',
    value: 'RUN'
  },
  {
    label: 'run-application',
    value: 'RUN_APPLICATION'
  }
]

export const masterTypeOptions = [
  {
    label: 'yarn',
    value: 'YARN'
  },
  {
    label: 'local',
    value: 'LOCAL'
  },
  {
    label: 'spark://',
    value: 'SPARK'
  },
  {
    label: 'mesos://',
    value: 'MESOS'
  }
]
  export const datasourceTypes = [
  {
    id: 0,
    code: 'MYSQL',
    disabled: false
  },
  {
    id: 1,
    code: 'POSTGRESQL',
    disabled: false
  },
  {
    id: 2,
    code: 'HIVE',
    disabled: false
  },
  {
    id: 3,
    code: 'SPARK',
    disabled: false
  },
  {
    id: 4,
    code: 'CLICKHOUSE',
    disabled: false
  },
  {
    id: 5,
    code: 'ORACLE',
    disabled: false
  },
  {
    id: 6,
    code: 'SQLSERVER',
    disabled: false
  },
  {
    id: 7,
    code: 'DB2',
    disabled: false
  },
  {
    id: 8,
    code: 'PRESTO',
    disabled: false
  },
  {
    id: 10,
    code: 'REDSHIFT',
    disabled: false
  },
  {
    id: 11,
    code: 'ATHENA',
    disabled: false
  },
  {
    id: 12,
    code: 'TRINO',
    disabled: false
  },
  {
    id: 13,
    code: 'STARROCKS',
    disabled: false
  },
  {
    id: 14,
    code: 'AZURESQL',
    disabled: false
  },
  {
    id: 15,
    code: 'DAMENG',
    disabled: false
  },
  {
    id: 16,
    code: 'OCEANBASE',
    disabled: false
  },
  {
    id: 17,
    code: 'SSH',
    disabled: true
  },
  {
    id: 18,
    code: 'KYUUBI',
    disabled: false
  },
  {
    id: 19,
    code: 'DATABEND',
    disabled: false
  },
  {
    id: 21,
    code: 'VERTICA',
    disabled: false
  },
  {
    id: 22,
    code: 'HANA',
    disabled: false
  },
  {
    id: 23,
    code: 'DORIS',
    disabled: false
  },
  {
    id: 24,
    code: 'ZEPPELIN',
    disabled: false
  },
  {
    id: 25,
    code: 'SAGEMAKER',
    disabled: false
  }

]
