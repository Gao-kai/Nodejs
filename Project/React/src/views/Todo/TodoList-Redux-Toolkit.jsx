import React from "react";
import dayjs from "dayjs";
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Popconfirm,
  Radio,
  message,
} from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";

/**
 * redux-toolkit中 不再需要connect
 * 而是采用hooks的方式再业务中注入dispatch和对应模块的状态
 *
 * actionCreators也不再通过props注入
 * 而是直接从reducerSclie中导入即可
 */

import { useSelector, useDispatch } from "react-redux";

import {
  getTaskListAsyncAction,
  addTaskAsyncAction,
  removeTaskAsyncAction,
  complteTaskAsyncAction,
  changeType,
} from "@/toolkit-store/features/todoSliceReducer";

function TodoList(props) {
  const [tableLoading, setTableLoading] = useState(true);
  const { activeType, dataSource } = useSelector((state) => state.todo);
  const dispatch = useDispatch();

  /* 静态数据 */
  const columns = [
    {
      title: "编号",
      dataIndex: "number",
      key: "number",
    },
    {
      title: "任务描述",
      dataIndex: "desc",
      key: "desc",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (value, { status }, index) => {
        const color = status === 0 ? "#ff5500" : "#87d068";
        const text = status === 0 ? "未完成" : "已完成";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "完成时间",
      key: "date",
      dataIndex: "date",
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {record.status === 0 ? (
            <Popconfirm
              title="完成任务"
              description="确定完成此任务?"
              okText="确定"
              cancelText="取消"
              onConfirm={() => handleFinish(record)}
            >
              <Button type="link" block>
                完成
              </Button>
            </Popconfirm>
          ) : null}

          <Popconfirm
            title="删除任务"
            description="确定删除此任务?"
            okText="确定"
            cancelText="取消"
            onConfirm={() => handleDelete(record)}
          >
            <Button type="link" danger block>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const typeOptions = [
    { label: "全部", value: "All" },
    { label: "未完成", value: "Unfinished" },
    { label: "已完成", value: "Done" },
  ];

  /* 生命周期函数 */
  useEffect(() => {
    const query = async () => {
      await dispatch(getTaskListAsyncAction());
      setTableLoading(false);
    };
    query();
  }, []);

  /* 函数 */

  const handleAdd = async () => {
    const id = String(Math.floor(Math.random() * 1000));
    setTableLoading(true);
    await dispatch(
      addTaskAsyncAction({
        key: id,
        number: id,
        desc: "新的计划",
        status: 0,
        date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      })
    );
    await dispatch(getTaskListAsyncAction(activeType));
    setTableLoading(false);
  };

  const handleTypeChange = async (e) => {
    setTableLoading(true);
    const value = e.target.value;
    await dispatch(changeType(value));
    await dispatch(getTaskListAsyncAction(value));
    setTableLoading(false);
  };

  const handleDelete = async (record) => {
    setTableLoading(true);
    const { key } = record;
    await dispatch(removeTaskAsyncAction(key));
    await dispatch(getTaskListAsyncAction(activeType));
    setTableLoading(false);
  };

  const handleFinish = async (record) => {
    console.log(record);
    setTableLoading(true);
    const { key } = record;
    await dispatch(complteTaskAsyncAction(key));
    await dispatch(getTaskListAsyncAction(activeType));
    setTableLoading(false);
  };

  /* render函数 */
  const addNewButton = (
    <Button type="primary" icon={<PlusCircleOutlined />} onClick={handleAdd}>
      新增任务
    </Button>
  );

  return (
    <>
      <Card
        title="Antd TodoList 任务管理系统"
        hoverable
        style={{ width: 800, margin: "100px auto" }}
        extra={addNewButton}
        className="container-card"
      >
        {/* 顶部 */}
        <Radio.Group
          options={typeOptions}
          onChange={(e) => handleTypeChange(e)}
          value={activeType}
          optionType="button"
          buttonStyle="solid"
        ></Radio.Group>

        {/* 列表 */}
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={tableLoading}
          pagination={false}
          rowKey={"key"}
          style={{ marginTop: "16px" }}
        />
      </Card>
    </>
  );
}

export default TodoList;
