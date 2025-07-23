# 测试文档 (Test Documentation)

## 概述

本项目包含全面的单元测试覆盖学生管理系统的核心业务逻辑，特别是时间段注册功能。

## 测试结构

### 后端测试 (Backend Tests)

#### 1. EnrollmentController 测试
**文件**: `backend/src/test/java/com/billieonsite/studentmanagement/controller/EnrollmentControllerTest.java`

**覆盖功能**:
- ✅ 获取所有注册记录
- ✅ 根据ID获取注册记录
- ✅ 根据学生ID获取注册记录
- ✅ 根据课程ID获取注册记录
- ✅ 创建新注册记录
- ✅ 删除注册记录
- ✅ 时间冲突验证
- ✅ 重复注册处理
- ✅ 权限验证
- ✅ 输入验证

**关键测试场景**:
- 成功创建注册
- 时间冲突检测
- 重复注册预防
- 学生/课程不存在错误处理
- 权限错误处理

#### 2. EnrollmentRepository 测试
**文件**: `backend/src/test/java/com/billieonsite/studentmanagement/repository/EnrollmentRepositoryTest.java`

**覆盖功能**:
- ✅ 时间冲突检测算法
- ✅ 特定时间段查询
- ✅ 学生/课程查询
- ✅ 复杂时间场景处理

**关键测试场景**:
- 重叠时间段检测
- 包含时间段检测
- 相邻时间段处理
- 相同时间段排除
- 不同日期处理
- 边界条件测试

#### 3. TimeRangeValidator 测试
**文件**: `backend/src/test/java/com/billieonsite/studentmanagement/validation/TimeRangeValidatorTest.java`

**覆盖功能**:
- ✅ 时间格式验证
- ✅ 时间范围逻辑验证
- ✅ 边界条件处理
- ✅ 空值处理

### 前端测试 (Frontend Tests)

#### 1. MyEnrollments 组件测试
**文件**: `frontend/src/pages/__tests__/MyEnrollments.test.tsx`

**覆盖功能**:
- ✅ 组件渲染
- ✅ 数据加载
- ✅ 取消注册功能
- ✅ 错误处理
- ✅ 用户交互
- ✅ 状态管理

#### 2. MyCourses 组件测试
**文件**: `frontend/src/pages/__tests__/MyCourses.test.tsx`

**覆盖功能**:
- ✅ 课程数据显示
- ✅ 时间段管理
- ✅ 课程取消功能
- ✅ 时间段取消功能
- ✅ 学生数量显示
- ✅ 导航功能

#### 3. API 集成测试
**文件**: `frontend/src/__tests__/api.test.tsx`

**覆盖功能**:
- ✅ 所有API端点
- ✅ 错误处理
- ✅ 网络错误处理
- ✅ HTTP状态码处理

## 运行测试

### 后端测试

#### 运行所有测试
```bash
cd backend
mvn test
```

#### 运行特定测试类
```bash
mvn test -Dtest=EnrollmentControllerTest
mvn test -Dtest=EnrollmentRepositoryTest
mvn test -Dtest=TimeRangeValidatorTest
```

#### 运行特定测试方法
```bash
mvn test -Dtest=EnrollmentControllerTest#createEnrollment_Success
```

#### 生成测试报告
```bash
mvn surefire-report:report
```
报告生成在: `target/site/surefire-report.html`

### 前端测试

#### 运行所有测试
```bash
cd frontend
npm test
```

#### 运行特定测试文件
```bash
npm test MyEnrollments.test.tsx
npm test MyCourses.test.tsx
npm test api.test.tsx
```

#### 运行测试并生成覆盖率报告
```bash
npm test -- --coverage
```

#### 在监听模式下运行测试
```bash
npm test -- --watchAll
```

## 测试覆盖的核心业务逻辑

### 1. 时间段注册系统
- **时间冲突检测**: 确保学生不能注册重叠的时间段
- **精确匹配处理**: 区分时间冲突和完全重复的注册
- **并发处理**: 防止竞争条件和重复注册

### 2. 教师时间段管理
- **单时间段取消**: 教师可以取消特定时间段而不删除整个课程
- **学生注册清理**: 取消时间段时自动删除相关学生注册
- **课程计划更新**: 正确更新课程的JSON计划数据

### 3. 数据一致性
- **数据库约束**: 确保唯一性约束正确工作
- **事务处理**: 保证数据操作的原子性
- **错误恢复**: 适当的错误处理和回滚机制

## 测试数据和场景

### 时间冲突场景
1. **重叠开始**: 新时间段开始时间在现有时间段内
2. **重叠结束**: 新时间段结束时间在现有时间段内
3. **完全包含**: 新时间段完全在现有时间段内
4. **完全覆盖**: 新时间段完全覆盖现有时间段
5. **相邻时间**: 相邻但不重叠的时间段（应该允许）

### 错误处理场景
1. **网络错误**: API调用失败
2. **权限错误**: 用户权限不足
3. **数据不存在**: 学生或课程不存在
4. **数据冲突**: 时间冲突或重复注册
5. **服务器错误**: 内部服务器错误

## 测试最佳实践

### 后端测试
- 使用 `@DataJpaTest` 进行Repository测试
- 使用 `@WebMvcTest` 进行Controller测试
- Mock外部依赖
- 测试边界条件和错误场景

### 前端测试
- 使用React Testing Library进行DOM测试
- Mock API调用
- 测试用户交互和状态变化
- 测试错误状态和边界条件

## 持续集成

### GitHub Actions配置示例
```yaml
name: Tests
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up JDK 17
        uses: actions/setup-java@v2
        with:
          java-version: '17'
      - name: Run tests
        run: |
          cd backend
          mvn test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd frontend
          npm install
      - name: Run tests
        run: |
          cd frontend
          npm test -- --coverage --watchAll=false
```

## 测试维护

### 添加新测试
1. 为新功能添加对应的单元测试
2. 确保测试覆盖主要业务逻辑路径
3. 包含错误处理和边界条件测试
4. 更新此文档

### 测试数据管理
- 使用工厂模式创建测试数据
- 保持测试数据的一致性
- 避免测试之间的数据依赖

### 性能考虑
- 避免重复的数据库操作
- 使用合适的测试范围（单元 vs 集成）
- 定期清理和优化慢测试

## 故障排除

### 常见问题
1. **测试数据库连接**: 确保H2数据库正确配置
2. **Mock配置**: 检查Mock对象的配置和返回值
3. **异步操作**: 使用`waitFor`处理异步操作
4. **测试隔离**: 确保测试之间不会相互影响

### 调试技巧
- 使用`@Sql`注解预设测试数据
- 使用`@DirtiesContext`重置应用上下文
- 检查测试日志输出
- 使用IDE调试功能单步执行测试