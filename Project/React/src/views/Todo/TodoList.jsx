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
import { useState, useEffect, useImperativeHandle, useRef } from "react";
import { flushSync } from "react-dom";

function TodoList1(props) {
  const [activeType, setActiveType] = useState("All");
  const [tableLoading, setTableLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);

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
    setTimeout(() => {
      const data = [
        {
          key: "1",
          number: 1,
          desc: "早起读书",
          status: 0,
          date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        },
        {
          key: "2",
          number: 2,
          desc: "早起吃饭",
          status: 1,
          date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        },
      ];

      flushSync(() => {
        setDataSource(data);
        setTableLoading(false);
        localStorage.setItem("localData", JSON.stringify(data));
      });
    }, 1000);
  }, []);

  /* 函数 */

  const handleAdd = () => {
    const len = dataSource.length;
    const newData = [
      ...dataSource,
      {
        key: String(len + 1),
        number: len + 1,
        desc: "新的计划",
        status: 0,
        date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      },
    ];

    flushSync(() => {
      setDataSource(newData);
      localStorage.setItem("localData", JSON.stringify(newData));
    });
  };

  const addNewButton = (
    <Button type="primary" icon={<PlusCircleOutlined />} onClick={handleAdd}>
      新增任务
    </Button>
  );

  const handleTypeChange = (e) => {
    const mapStatus = {
      Done: 1,
      Unfinished: 0,
    };

    const value = e.target.value;

    let filterData = JSON.parse(localStorage.getItem("localData"));

    if (value !== "All") {
      filterData = filterData.filter((item) => {
        return item.status === mapStatus[value];
      });
    }

    setActiveType(e.target.value);
    setDataSource(filterData);
  };

  const handleDelete = (record) => {
    const { key } = record;
    const index = dataSource.findIndex((item) => item.key === key);
    if (index !== -1) {
      const clone = [...dataSource];
      clone.splice(index, 1);

      flushSync(() => {
        setDataSource(clone);
        message.success("删除成功！");
        localStorage.setItem("localData", JSON.stringify(clone));
      });
    }
    console.log(record);
  };

  const handleFinish = (record) => {
    console.log(record);
    const { key } = record;
    const index = dataSource.findIndex((item) => item.key === key);

    if (index !== -1) {
      const currItem = dataSource[index];
      currItem.status = 1;
      const clone = [...dataSource];
      clone.splice(index, 1, currItem);

      flushSync(() => {
        setDataSource(clone);
        message.success("恭喜你！完成一条任务！");
        localStorage.setItem("localData", JSON.stringify(clone));
      });
    }
  };

  /* render函数 */
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

class TodoList extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      activeType: "All",
      dataSource: [],
      tableLoading: true,
    };
  }

  columns = [
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
              onConfirm={() => this.handleFinish(record)}
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
            onConfirm={() => this.handleDelete(record)}
          >
            <Button type="link" danger block>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  typeOptions = [
    { label: "全部", value: "All" },
    { label: "未完成", value: "Unfinished" },
    { label: "已完成", value: "Done" },
  ];

  componentDidMount() {
    setTimeout(() => {
      const dataSource = [
        {
          key: "1",
          number: 1,
          desc: "早起读书",
          status: 0,
          date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        },
        {
          key: "2",
          number: 2,
          desc: "早起吃饭",
          status: 1,
          date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        },
      ];

      this.setState(
        {
          dataSource,
          tableLoading: false,
        },
        () => {
          localStorage.setItem("localData", JSON.stringify(dataSource));
        }
      );
    }, 1000);
  }

  render() {
    const addNewButton = (
      <Button
        type="primary"
        icon={<PlusCircleOutlined />}
        onClick={() => this.handleAdd()}
      >
        新增任务
      </Button>
    );

    const { activeType, dataSource, tableLoading } = this.state;
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
            options={this.typeOptions}
            onChange={(e) => this.handleTypeChange(e)}
            value={activeType}
            optionType="button"
            buttonStyle="solid"
          ></Radio.Group>

          {/* 列表 */}
          <Table
            columns={this.columns}
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

  handleAdd = () => {
    const { dataSource } = this.state;
    const len = dataSource.length;

    dataSource.push({
      key: String(len + 1),
      number: len + 1,
      desc: "新的计划",
      status: 0,
      date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    });

    this.setState(
      {
        dataSource: [...dataSource],
      },
      () => {
        message.success("新增成功！");
        localStorage.setItem("localData", JSON.stringify(dataSource));
      }
    );
  };

  handleTypeChange = (e) => {
    console.log(e);

    const mapStatus = {
      Done: 1,
      Unfinished: 0,
    };

    const value = e.target.value;

    let filterData = JSON.parse(localStorage.getItem("localData"));

    if (value !== "All") {
      filterData = filterData.filter((item) => {
        return item.status === mapStatus[value];
      });
    }

    this.setState({
      activeType: e.target.value,
      dataSource: filterData,
    });
  };

  handleDelete = (record) => {
    const { dataSource } = this.state;
    const { key } = record;
    const index = dataSource.findIndex((item) => item.key === key);
    if (index !== -1) {
      dataSource.splice(index, 1);
      this.setState(
        {
          dataSource: [...dataSource],
        },
        () => {
          message.success("删除成功！");
          localStorage.setItem("localData", JSON.stringify(dataSource));
        }
      );
    }
    console.log(record);
  };

  handleFinish = (record) => {
    console.log(record);
    const { dataSource } = this.state;
    const { key } = record;
    const index = dataSource.findIndex((item) => item.key === key);

    if (index !== -1) {
      const currItem = dataSource[index];
      currItem.status = 1;
      dataSource.splice(index, 1, currItem);

      this.setState(
        {
          dataSource: [...dataSource],
        },
        () => {
          message.success("恭喜你！完成一条任务！");
          localStorage.setItem("localData", JSON.stringify(dataSource));
        }
      );
    }
  };
}

export default TodoList1;
